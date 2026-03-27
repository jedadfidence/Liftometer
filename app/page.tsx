import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Liftometer</CardTitle>
          <CardDescription>Coming soon</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
