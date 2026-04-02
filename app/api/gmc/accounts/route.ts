import { getUserId } from "@/lib/get-user-id";
import { getGmcAccounts } from "@/lib/tokens";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = getGmcAccounts(userId);
  const safeAccounts = accounts.map(({ merchantId, name }) => ({ merchantId, name }));

  return Response.json({ accounts: safeAccounts });
}
