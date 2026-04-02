import { getUserId } from "@/lib/get-user-id";
import { getCampaignIdsForProduct, getGadsAccounts } from "@/lib/tokens";
import { fetchCampaigns } from "@/lib/gads/campaigns";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const campaignIds = getCampaignIdsForProduct(userId, id);

  if (campaignIds.length === 0) {
    return Response.json({ campaigns: [] });
  }

  const accounts = getGadsAccounts(userId);
  const allCampaigns = await fetchCampaigns(accounts);
  const linked = allCampaigns.filter((c) => campaignIds.includes(c.id));

  return Response.json({ campaigns: linked });
}
