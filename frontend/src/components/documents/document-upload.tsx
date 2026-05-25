"use client";

import { useEffect, useState } from "react";
import { FileSearch, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import type { DocumentReport } from "@/types/api";

export function DocumentUpload() {
  const [documents, setDocuments] = useState<DocumentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.documents().then(setDocuments).catch(() => undefined);
  }, []);

  async function upload(file: File | undefined) {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const uploaded = await api.uploadDocument(file);
      setDocuments((current) => [uploaded, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-primary" />
            Upload PDF
          </CardTitle>
          <CardDescription>Extract text, classify the document, check completeness, and produce a validation report.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/35 p-6 text-center hover:bg-muted">
            <FileSearch className="mb-3 h-8 w-8 text-primary" />
            <span className="text-sm font-medium">{loading ? "Processing..." : "Choose a PDF document"}</span>
            <span className="mt-1 text-xs text-muted-foreground">Passport, bank statement, invitation, insurance, bookings</span>
            <input className="sr-only" type="file" accept="application/pdf" onChange={(event) => upload(event.target.files?.[0])} />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button variant="outline" className="w-full" disabled>
            OCR-ready validation pipeline
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {documents.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="p-6 text-sm text-muted-foreground">Uploaded document reports appear here.</CardContent>
          </Card>
        )}
        {documents.map((document) => (
          <Card key={document.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{document.filename}</CardTitle>
                  <CardDescription>{document.document_type.replaceAll("_", " ")}</CardDescription>
                </div>
                <Badge variant={document.completeness_score > 80 ? "accent" : "secondary"}>{document.completeness_score}%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={document.completeness_score} />
              <div>
                <p className="text-sm font-medium">Missing fields</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {document.missing_fields.length ? document.missing_fields.join(", ") : "None detected"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Recommendations</p>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {(document.validation_report.recommendations ?? []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
