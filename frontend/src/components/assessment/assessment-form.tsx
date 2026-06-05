"use client";

import { FormEvent, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { EligibilityInput, EligibilityResult } from "@/types/api";

const initialProfile: EligibilityInput = {
  nationality: "India",
  destination_country: "United Kingdom",
  travel_purpose: "Tourism",
  employment_status: "Employed",
  annual_income: 45000,
  travel_history: "UAE and Singapore",
  family_sponsorship: { has_sponsor: false }
};

export function AssessmentForm() {
  const [profile, setProfile] = useState(initialProfile);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof EligibilityInput>(key: K, value: EligibilityInput[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setResult(await api.assess(profile));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assessment failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card>
        <CardHeader>
          <CardTitle>Eligibility assessment</CardTitle>
          <CardDescription>Enter your details to calculate approval probability and risk factors.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Nationality" value={profile.nationality} onChange={(value) => update("nationality", value)} />
            <Field label="Destination country" value={profile.destination_country} onChange={(value) => update("destination_country", value)} />
            <Field label="Travel purpose" value={profile.travel_purpose} onChange={(value) => update("travel_purpose", value)} />
            <Field label="Employment status" value={profile.employment_status} onChange={(value) => update("employment_status", value)} />
            <Field
              label="Annual income"
              type="number"
              value={String(profile.annual_income)}
              onChange={(value) => update("annual_income", Number(value))}
            />
            <div className="space-y-1.5">
              <Label>Family sponsorship</Label>
              <button
                type="button"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                  profile.family_sponsorship.has_sponsor
                    ? "border-primary/40 bg-primary/5 text-foreground"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
                onClick={() =>
                  update("family_sponsorship", {
                    ...profile.family_sponsorship,
                    has_sponsor: !profile.family_sponsorship.has_sponsor
                  })
                }
              >
                {profile.family_sponsorship.has_sponsor ? "Sponsor available" : "No sponsor"}
              </button>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="history">Travel history</Label>
              <Textarea id="history" value={profile.travel_history} onChange={(event) => update("travel_history", event.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Scoring..." : "Calculate eligibility"}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {!result && <p className="text-sm text-muted-foreground">Your score and recommendations will appear here.</p>}
          {result && (
            <>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Score</span>
                  <span className="text-2xl font-semibold tabular-nums">{result.eligibility_score}<span className="text-sm font-normal text-muted-foreground">/100</span></span>
                </div>
                <Progress value={result.eligibility_score} />
                <Badge variant={result.approval_probability === "High" ? "accent" : "warning"}>
                  {result.approval_probability} probability
                </Badge>
              </div>
              <ResultList title="Risk factors" items={result.risk_factors} empty="No major risks detected." />
              <ResultList title="Recommendations" items={result.recommendations} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ResultList({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</h3>
      {items.length === 0 && <p className="text-sm text-muted-foreground">{empty}</p>}
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="rounded-lg border p-3 text-sm text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
