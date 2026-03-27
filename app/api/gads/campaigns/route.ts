import { auth } from "@/lib/auth";
import { getGadsAccounts } from "@/lib/tokens";
import { fetchCampaigns } from "@/lib/gads/campaigns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = getGadsAccounts(session.user.id);
  const campaigns = await fetchCampaigns(accounts);

  return Response.json({ campaigns });
}
