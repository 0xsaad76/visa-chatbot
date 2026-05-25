"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bot, MessageSquarePlus, Send, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <Card className="min-h-[680px]">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Assistant
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="destination" className="sr-only">
                Destination
              </Label>
              <Input id="destination" className="w-44" value={destination} onChange={(event) => setDestination(event.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-[600px] flex-col gap-4 p-4">
          <div className="flex-1 space-y-4 overflow-y-auto rounded-lg bg-muted/35 p-4">
            {messages.length === 0 && (
              <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 text-primary" />
                <p>Ask about eligibility, documents, timelines, refusal risks, or next steps.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={message.role === "user" ? "ml-auto max-w-[82%]" : "mr-auto max-w-[88%]"}>
                <div className={message.role === "user" ? "rounded-lg bg-primary p-3 text-primary-foreground" : "rounded-lg border bg-card p-3"}>
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.content || (loading ? "Thinking..." : "")}</p>
                </div>
              </div>
            ))}
          </div>
          <form className="flex gap-2" onSubmit={submit}>
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a country-specific visa question..."
              className="min-h-12 resize-none"
            />
            <Button type="submit" size="icon" disabled={loading || !conversation} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
      <aside className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(suggestions.length ? suggestions : ["What checklist do I need?", "How long does processing take?", "What are common refusal reasons?"]).map(
              (question) => (
                <Button key={question} variant="outline" className="w-full justify-start text-left" onClick={() => setInput(question)}>
                  <MessageSquarePlus className="h-4 w-4" />
                  <span className="truncate">{question}</span>
                </Button>
              )
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {citations.length === 0 && <p className="text-sm text-muted-foreground">Knowledge base citations appear here after a response.</p>}
            {citations.map((citation) => (
              <div key={`${citation.title}-${citation.source_path}`} className="rounded-md border p-3">
                <Badge variant="outline">{citation.title}</Badge>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{citation.snippet}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
