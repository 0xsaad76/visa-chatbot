"use client";

import { useEffect, useState } from "react";
import { Bot, FileCheck2, Gauge, LayoutDashboard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import type { DashboardSummary } from "@/types/api";

export function DashboardClient() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.dashboard().then(setSummary).catch((err) => setError(err instanceof Error ? err.message : "Sign in to view your dashboard."));
  }, []);

  const cards = [
    { label: "Assessments", value: summary?.assessments_count ?? 0, icon: Gauge },
    { label: "Documents", value: summary?.documents_count ?? 0, icon: FileCheck2 },
    { label: "Conversations", value: summary?.conversations_count ?? 0, icon: Bot },
    { label: "Average score", value: summary?.average_eligibility_score ?? 0, icon: LayoutDashboard }
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Applicant Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track assessments, document readiness, conversations, and application progress.</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest scoring events from the applicant workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary?.recent_activity.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
            {summary?.recent_activity.map((item) => (
              <div key={`${item.type}-${item.created_at}`} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{item.type}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                </div>
                <Badge variant="accent">{item.score}/100 {item.probability}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Checklist Completion</CardTitle>
            <CardDescription>Rollup percentage for active visa application checklist items.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-semibold">{summary?.checklist_completion_percentage ?? 0}%</div>
            <Progress value={summary?.checklist_completion_percentage ?? 0} />
            <p className="text-sm text-muted-foreground">
              Completion is ready to connect to per-application checklist state once applicants begin checking off items.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
