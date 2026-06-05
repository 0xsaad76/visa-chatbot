"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Upload document</CardTitle>
          <CardDescription>Upload a PDF to extract text, classify, and validate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center hover:border-primary/30 hover:bg-muted/40 transition-colors">
            <Upload className="mb-3 h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{loading ? "Processing..." : "Choose a PDF"}</span>
            <span className="mt-1 text-xs text-muted-foreground">Passport, bank statement, invitation, etc.</span>
            <input className="sr-only" type="file" accept="application/pdf" onChange={(event) => upload(event.target.files?.[0])} />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {documents.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="p-6 text-sm text-muted-foreground">Document reports will appear here after upload.</CardContent>
          </Card>
        )}
        {documents.map((document) => (
          <Card key={document.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{document.filename}</CardTitle>
                  <CardDescription>{document.document_type.replaceAll("_", " ")}</CardDescription>
                </div>
                <Badge variant={document.completeness_score > 80 ? "accent" : "warning"}>
                  {document.completeness_score}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={document.completeness_score} />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Missing fields</p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {document.missing_fields.length ? document.missing_fields.join(", ") : "None detected"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recommendations</p>
                <ul className="mt-1.5 space-y-1.5 text-sm text-muted-foreground">
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
