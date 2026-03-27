import { auth } from "@/lib/auth";
import { getGadsAccounts } from "@/lib/tokens";
import { fetchAds } from "@/lib/gads/ads";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const adGroupId = searchParams.get("adGroupId");

  if (!adGroupId) {
    return Response.json(
      { error: "adGroupId query parameter is required" },
      { status: 400 },
    );
  }

  const accounts = getGadsAccounts(session.user.id);
  const ads = await fetchAds(adGroupId, accounts);

  return Response.json({ ads });
}
