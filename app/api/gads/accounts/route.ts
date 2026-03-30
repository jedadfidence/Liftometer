import { getUserId } from "@/lib/get-user-id";
import { getGadsAccounts } from "@/lib/tokens";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = getGadsAccounts(userId);
  const safeAccounts = accounts.map(({ customerId, name }) => ({ customerId, name }));

  return Response.json({ accounts: safeAccounts });
}
