import { auth } from "@/lib/auth";
import { getGadsAccounts } from "@/lib/tokens";
import { fetchAdGroups } from "@/lib/gads/adgroups";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return Response.json(
      { error: "campaignId query parameter is required" },
      { status: 400 },
    );
  }

  const accounts = getGadsAccounts(session.user.id);
  const adGroups = await fetchAdGroups(campaignId, accounts);

  return Response.json({ adGroups });
}
