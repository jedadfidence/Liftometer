import { addGmcAccount } from "@/lib/tokens";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const userId = request.nextUrl.searchParams.get("state");

  if (!code || !userId) {
    redirect("/dashboard?error=gmc_oauth_failed");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_MC_CLIENT_ID!,
      client_secret: process.env.GOOGLE_MC_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/gmc/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    redirect("/dashboard?error=gmc_token_exchange_failed");
  }

  const tokens = await tokenResponse.json();

  addGmcAccount(userId, {
    merchantId: "MC-" + Date.now(),
    name: "Merchant Center Account",
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  });

  redirect("/dashboard/settings?gmc_connected=true");
}
