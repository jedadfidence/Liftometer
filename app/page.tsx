import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  // Skip auth check when SKIP_AUTH is enabled
  if (process.env.SKIP_AUTH === "true") {
    redirect("/dashboard");
  }

  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Liftometer</CardTitle>
          <CardDescription>
            Clone your Google Ads campaigns to OpenAI in one click
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/sign-in">Get Started</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
