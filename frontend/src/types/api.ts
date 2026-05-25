export type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export type EligibilityInput = {
  nationality: string;
  destination_country: string;
  travel_purpose: string;
  employment_status: string;
  annual_income: number;
  travel_history: string;
  family_sponsorship: {
    has_sponsor: boolean;
    relationship?: string;
    sponsor_status?: string;
  };
};

export type EligibilityResult = {
  id?: string;
  profile_id?: string;
  eligibility_score: number;
  approval_probability: string;
  risk_factors: string[];
  recommendations: string[];
};

export type VisaRequirement = {
  id: string;
  destination_country: string;
  visa_type: string;
  processing_time: string;
  visa_fee: string;
  required_documents: string[];
  eligibility_rules: string[];
  application_steps: string[];
  notes: string;
};

export type ChecklistResponse = {
  destination_country: string;
  visa_type: string;
  completion_percentage: number;
  items: { label: string; reason: string; required: boolean; completed: boolean }[];
};

export type Conversation = {
  id: string;
  title: string;
  destination_country?: string;
  applicant_profile: Record<string, unknown>;
};

export type DocumentReport = {
  id: string;
  filename: string;
  content_type: string;
  document_type: string;
  completeness_score: number;
  missing_fields: string[];
  validation_report: {
    detected_fields?: string[];
    recommendations?: string[];
  };
};

export type DashboardSummary = {
  assessments_count: number;
  documents_count: number;
  conversations_count: number;
  average_eligibility_score: number;
  checklist_completion_percentage: number;
  recent_activity: { type: string; score?: number; probability?: string; created_at: string }[];
};
