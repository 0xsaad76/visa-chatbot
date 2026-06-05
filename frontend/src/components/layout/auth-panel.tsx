"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, setToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("applicant@example.com");
  const [fullName, setFullName] = useState("Portfolio Applicant");
  const [password, setPassword] = useState("password123");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function submit() {
    setLoading(true);
    setStatus(null);
    try {
      const response =
        mode === "register"
          ? await api.register({ email, full_name: fullName, password })
          : await api.login({ email, password });
      setToken(response.access_token);
      setStatus(`Signed in as ${response.user.full_name}`);

      router.push("/assistant");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Get started</CardTitle>
        <CardDescription>Create an account or sign in to save your progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${mode === "register" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
          <button
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${mode === "login" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
        </div>
        {mode === "register" && (
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <Button className="w-full" onClick={submit} disabled={loading}>
          {loading ? "Working..." : "Continue"}
        </Button>
        {status && <p className="text-center text-xs text-muted-foreground">{status}</p>}
      </CardContent>
    </Card>
  );
}
