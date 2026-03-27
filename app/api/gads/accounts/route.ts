import { auth } from "@/lib/auth";
import { getGadsAccounts } from "@/lib/tokens";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = getGadsAccounts(session.user.id);
  const safeAccounts = accounts.map(({ customerId, name }) => ({ customerId, name }));

  return Response.json({ accounts: safeAccounts });
}
