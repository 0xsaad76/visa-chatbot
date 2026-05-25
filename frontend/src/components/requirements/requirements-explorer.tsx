"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Search } from "lucide-react";

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
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Visa Requirements Explorer
          </CardTitle>
          <CardDescription>Browse country-specific documents, processing times, fees, rules, and application steps.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search destination or visa type" value={query} onChange={(event) => setQuery(event.target.value)} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((item) => (
              <Card key={item.id} className="shadow-none">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{item.destination_country}</CardTitle>
                      <CardDescription>{item.visa_type}</CardDescription>
                    </div>
                    <Badge variant="outline">{item.visa_fee}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{item.processing_time}</p>
                  <RequirementList title="Documents" items={item.required_documents} />
                  <RequirementList title="Steps" items={item.application_steps} />
                  <Button variant="outline" className="w-full" onClick={() => generate(item)}>
                    <ClipboardCheck className="h-4 w-4" />
                    Generate checklist
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personalized Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!checklist && <p className="text-sm text-muted-foreground">Generate a checklist from any visa requirement.</p>}
          {checklist && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{checklist.destination_country}</span>
                <Badge variant="accent">{checklist.visa_type}</Badge>
              </div>
              <Progress value={checklist.completion_percentage} />
              <div className="space-y-2">
                {checklist.items.map((item) => (
                  <div key={item.label} className="rounded-md border p-3">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
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

function RequirementList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 5).map((item) => (
          <Badge key={item} variant="secondary">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
