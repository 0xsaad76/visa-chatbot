import Link from "next/link";
import { ArrowRight, Bot, FileCheck2, Gauge, ShieldCheck } from "lucide-react";

import { AuthPanel } from "@/components/layout/auth-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Bot, label: "Streaming RAG assistant" },
  { icon: Gauge, label: "Eligibility scoring" },
  { icon: FileCheck2, label: "PDF document verification" },
  { icon: ShieldCheck, label: "JWT-secured dashboard" }
];

export default function Home() {
  return (
    <div className="surface-grid">
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-[1fr_420px]">
        <div className="max-w-3xl space-y-8">
          <Badge variant="accent">Visa consultancy AI platform</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl lg:text-6xl">
              AI Visa Assistant
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Guide applicants from first question to document-ready submission with country-specific RAG answers,
              personalized checklists, eligibility risk scoring, and PDF pre-verification.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.label} className="flex items-center gap-3 rounded-lg border bg-card/80 p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/assistant">
                Open assistant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/assessment">Run assessment</Link>
            </Button>
          </div>
        </div>
        <AuthPanel />
      </section>
    </div>
  );
}
