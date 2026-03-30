import { auth } from "@/lib/auth";

const DEV_USER_ID = "dev-user";

/**
 * Returns the authenticated user's ID, or a dev fallback when SKIP_AUTH=true.
 * Returns null if unauthenticated and SKIP_AUTH is not set.
 */
export async function getUserId(): Promise<string | null> {
  if (process.env.SKIP_AUTH === "true") {
    return DEV_USER_ID;
  }
  const session = await auth();
  return session?.user?.id ?? null;
}
