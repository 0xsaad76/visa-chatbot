import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AuthPanel } from "@/components/layout/auth-panel";
import { Button } from "@/components/ui/button";

const features = [
  "Streaming RAG assistant",
  "Eligibility scoring",
  "PDF document verification",
  "JWT-secured dashboard"
];

export default function Home() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-57px)] max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_380px]">
      <div className="max-w-xl space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-medium text-primary">Visa AI BOT</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            Navigate visa applications with confidence
          </h1>
          {/* <p className="max-w-md text-[15px] leading-7 text-muted-foreground">
            From eligibility scoring to document verification — get country-specific guidance, personalized checklists, and AI-powered answers.
          </p> */}
        </div>
        <ul className="space-y-2.5">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-primary" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/assistant">
              Open assistant
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/assessment">Run assessment</Link>
          </Button>
        </div>
      </div>
      <AuthPanel />
    </section>
  );
}
