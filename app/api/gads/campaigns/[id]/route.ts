import { getUserId } from "@/lib/get-user-id";
import { getGadsAccounts } from "@/lib/tokens";
import { fetchCampaignById } from "@/lib/gads/campaigns";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const accounts = getGadsAccounts(userId);
  const campaign = await fetchCampaignById(id, accounts);

  if (!campaign) {
    return Response.json({ error: "Campaign not found" }, { status: 404 });
  }

  return Response.json({ campaign });
}
