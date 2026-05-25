import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Loading workspace...</CardContent>
      </Card>
    </div>
  );
}
