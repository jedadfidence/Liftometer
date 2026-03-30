import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  // Set SKIP_AUTH=true in .env.local to bypass auth during development
  if (process.env.SKIP_AUTH === "true") {
    return <>{children}</>;
  }

  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return <>{children}</>;
}
