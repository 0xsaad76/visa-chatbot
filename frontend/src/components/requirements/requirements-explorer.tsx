"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import type { ChecklistResponse, VisaRequirement } from "@/types/api";

export function RequirementsExplorer() {
  const [requirements, setRequirements] = useState<VisaRequirement[]>([]);
  const [query, setQuery] = useState("");
  const [checklist, setChecklist] = useState<ChecklistResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.requirements().then(setRequirements).catch((err) => setError(err instanceof Error ? err.message : "Could not load requirements."));
  }, []);

  const filtered = useMemo(
    () =>
      requirements.filter((item) =>
        `${item.destination_country} ${item.visa_type}`.toLowerCase().includes(query.toLowerCase())
      ),
    [requirements, query]
  );

  async function generate(item: VisaRequirement) {
    setChecklist(await api.checklist({ destination_country: item.destination_country, visa_type: item.visa_type }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Visa requirements</CardTitle>
          <CardDescription>Browse country-specific documents, processing times, fees, and application steps.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search by destination or visa type..." value={query} onChange={(event) => setQuery(event.target.value)} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((item) => (
              <div key={item.id} className="rounded-xl border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{item.destination_country}</p>
                    <p className="text-xs text-muted-foreground">{item.visa_type}</p>
                  </div>
                  <Badge variant="outline">{item.visa_fee}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.processing_time}</p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Documents</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.required_documents.slice(0, 4).map((doc) => (
                      <span key={doc} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                        {doc}
                      </span>
                    ))}
                    {item.required_documents.length > 4 && (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                        +{item.required_documents.length - 4}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => generate(item)}>
                  Generate checklist
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!checklist && <p className="text-sm text-muted-foreground">Select a visa requirement to generate a checklist.</p>}
          {checklist && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{checklist.destination_country}</span>
                <Badge variant="default">{checklist.visa_type}</Badge>
              </div>
              <Progress value={checklist.completion_percentage} />
              <div className="space-y-2">
                {checklist.items.map((item) => (
                  <div key={item.label} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
