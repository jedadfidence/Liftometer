import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface AccountCardProps {
  name: string;
  customerId: string;
}

export function AccountCard({ name, customerId }: AccountCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <CardTitle className="text-base font-medium">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary" className="font-mono text-xs">{customerId}</Badge>
      </CardContent>
    </Card>
  );
}
