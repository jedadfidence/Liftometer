import { getUserId } from "@/lib/get-user-id";
import { redirect } from "next/navigation";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_MC_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/gmc/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/content",
    access_type: "offline",
    prompt: "consent",
    state: userId,
  });

  redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
