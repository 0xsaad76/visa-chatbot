"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, streamChat } from "@/lib/api";
import type { Conversation } from "@/types/api";

type Message = { role: "user" | "assistant"; content: string };

export function ChatClient() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [destination, setDestination] = useState("Canada");
  const [input, setInput] = useState("What are the main visitor visa risks for my profile?");
  const [messages, setMessages] = useState<Message[]>([]);
  const [citations, setCitations] = useState<{ title: string; source_path: string; snippet: string }[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .createConversation({ title: "Visa planning chat", destination_country: "Canada" })
      .then(setConversation)
      .catch((err) => setError(err instanceof Error ? err.message : "Sign in to start a conversation."));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!conversation || !input.trim()) return;
    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    setError(null);
    setMessages((current) => [...current, { role: "user", content: userMessage }, { role: "assistant", content: "" }]);
    try {
      await streamChat(
        conversation.id,
        { message: userMessage, destination_country: destination },
        (eventName, data) => {
          if (eventName === "token") {
            const text = (data as { text: string }).text;
            setMessages((current) => {
              const copy = [...current];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { ...last, content: last.content + text };
              return copy;
            });
          }
          if (eventName === "citations") setCitations(data as typeof citations);
          if (eventName === "suggestions") setSuggestions(data as string[]);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Streaming failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>Assistant</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="destination" className="sr-only">
              Destination
            </Label>
            <Input
              id="destination"
              className="w-36 text-xs"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Country"
            />
          </div>
        </CardHeader>
        <CardContent className="flex min-h-[560px] flex-col gap-4 p-4">
          <div className="flex-1 space-y-3 overflow-y-auto rounded-lg p-3">
            {messages.length === 0 && (
              <div className="flex h-full min-h-72 flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-muted-foreground">Ask about eligibility, documents, timelines, or next steps.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={message.role === "user" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[85%]"}>
                <div
                  className={
                    message.role === "user"
                      ? "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground text-sm"
                      : "rounded-2xl rounded-bl-md border px-4 py-2.5 bg-card"
                  }
                >
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {message.content ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : (
                        loading && "Thinking..."
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <form className="flex items-end gap-2" onSubmit={submit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question..."
              className="flex-1 rounded-xl border bg-transparent px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            <Button type="submit" size="icon" className="rounded-xl" disabled={loading || !conversation} aria-label="Send message">
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>
      <aside className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Suggested</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(suggestions.length ? suggestions : ["What checklist do I need?", "How long does processing take?", "What are common refusal reasons?"]).map(
              (question) => (
                <button
                  key={question}
                  className="w-full rounded-lg px-3 py-2 text-left text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  onClick={() => setInput(question)}
                >
                  {question}
                </button>
              )
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {citations.length === 0 && <p className="text-xs text-muted-foreground">Citations appear after a response.</p>}
            {citations.map((citation) => (
              <div key={`${citation.title}-${citation.source_path}`} className="rounded-lg border p-3">
                <p className="text-xs font-medium">{citation.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{citation.snippet}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
