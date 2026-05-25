"use client";

import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, setToken } from "@/lib/api";

export function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("applicant@example.com");
  const [fullName, setFullName] = useState("Portfolio Applicant");
  const [password, setPassword] = useState("password123");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Applicant Access</CardTitle>
        <CardDescription>Create a demo account or sign in to persist assessments and documents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button variant={mode === "register" ? "default" : "outline"} onClick={() => setMode("register")}>
            <UserPlus className="h-4 w-4" />
            Register
          </Button>
          <Button variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")}>
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        </div>
        {mode === "register" && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <Button className="w-full" onClick={submit} disabled={loading}>
          {loading ? "Working..." : "Continue"}
        </Button>
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
      </CardContent>
    </Card>
  );
}
