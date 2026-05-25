"use client";

import { FormEvent, useState } from "react";
import { Gauge, ListChecks } from "lucide-react";

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
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Eligibility Assessment
          </CardTitle>
          <CardDescription>Capture core applicant details and calculate approval probability, risks, and recommendations.</CardDescription>
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
            <div className="space-y-2">
              <Label>Family sponsorship</Label>
              <Button
                type="button"
                variant={profile.family_sponsorship.has_sponsor ? "default" : "outline"}
                className="w-full"
                onClick={() =>
                  update("family_sponsorship", {
                    ...profile.family_sponsorship,
                    has_sponsor: !profile.family_sponsorship.has_sponsor
                  })
                }
              >
                {profile.family_sponsorship.has_sponsor ? "Sponsor available" : "No sponsor"}
              </Button>
            </div>
            <div className="space-y-2 sm:col-span-2">
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
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-5 w-5 text-accent" />
            Assessment Result
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {!result && <p className="text-sm text-muted-foreground">Your score, risk factors, and next actions appear here.</p>}
          {result && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Eligibility score</span>
                  <Badge variant="accent">{result.eligibility_score}/100</Badge>
                </div>
                <Progress value={result.eligibility_score} />
                <Badge variant={result.approval_probability === "High" ? "accent" : "secondary"}>
                  {result.approval_probability} approval probability
                </Badge>
              </div>
              <ResultList title="Risk factors" items={result.risk_factors} empty="No major risk factors detected." />
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
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ResultList({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length === 0 && <p className="text-sm text-muted-foreground">{empty}</p>}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="rounded-md border p-3 text-sm text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
