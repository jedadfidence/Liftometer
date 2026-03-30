import { getUserId } from "@/lib/get-user-id";
import { getGadsAccounts } from "@/lib/tokens";
import { fetchCampaigns } from "@/lib/gads/campaigns";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = getGadsAccounts(userId);
  const campaigns = await fetchCampaigns(accounts);

  return Response.json({ campaigns });
}
