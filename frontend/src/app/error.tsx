"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <p className="text-sm font-medium text-destructive">Something went wrong</p>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <Button className="mt-6" variant="outline" onClick={reset}>Try again</Button>
    </div>
  );
}
