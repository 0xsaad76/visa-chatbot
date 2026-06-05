"use client";

import { useEffect, useState } from "react";

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
    { label: "Assessments", value: summary?.assessments_count ?? 0 },
    { label: "Documents", value: summary?.documents_count ?? 0 },
    { label: "Conversations", value: summary?.conversations_count ?? 0 },
    { label: "Avg. score", value: summary?.average_eligibility_score ?? 0 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your assessments, documents, and application progress.</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest scoring events from your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary?.recent_activity.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
            {summary?.recent_activity.map((item) => (
              <div key={`${item.type}-${item.created_at}`} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{item.type}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                </div>
                <Badge variant="accent">{item.score}/100</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Checklist progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-semibold tabular-nums">{summary?.checklist_completion_percentage ?? 0}%</p>
            <Progress value={summary?.checklist_completion_percentage ?? 0} />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Tracks completion across your active visa application checklist items.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
