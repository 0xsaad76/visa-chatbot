import type {
  ChecklistResponse,
  Conversation,
  DashboardSummary,
  DocumentReport,
  EligibilityInput,
  EligibilityResult,
  TokenResponse,
  VisaRequirement
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "visa_assistant_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export const api = {
  register: (payload: { email: string; full_name: string; password: string }) =>
    request<TokenResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  requirements: () => request<VisaRequirement[]>("/requirements"),
  checklist: (payload: { destination_country: string; visa_type: string; profile?: EligibilityInput }) =>
    request<ChecklistResponse>("/requirements/checklist", { method: "POST", body: JSON.stringify(payload) }),
  assess: (payload: EligibilityInput) =>
    request<EligibilityResult>("/eligibility/assessments", { method: "POST", body: JSON.stringify(payload) }),
  assessments: () => request<EligibilityResult[]>("/eligibility/assessments"),
  createConversation: (payload: { title: string; destination_country?: string; applicant_profile?: Record<string, unknown> }) =>
    request<Conversation>("/chat/conversations", { method: "POST", body: JSON.stringify(payload) }),
  conversations: () => request<Conversation[]>("/chat/conversations"),
  uploadDocument: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<DocumentReport>("/documents/upload", { method: "POST", body: form });
  },
  documents: () => request<DocumentReport[]>("/documents"),
  dashboard: () => request<DashboardSummary>("/dashboard/summary")
};

export async function streamChat(
  conversationId: string,
  payload: { message: string; destination_country?: string; applicant_profile?: Record<string, unknown> },
  onEvent: (event: string, data: unknown) => void
) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok || !response.body) throw new Error("Unable to stream assistant response.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const raw of events) {
      const event = raw.match(/^event: (.+)$/m)?.[1] ?? "message";
      const dataRaw = raw.match(/^data: (.+)$/m)?.[1] ?? "{}";
      onEvent(event, JSON.parse(dataRaw));
    }
  }
}
