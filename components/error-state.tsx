import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div>
          <h3 className="text-lg font-medium">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        {onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}
      </CardContent>
    </Card>
  );
}
