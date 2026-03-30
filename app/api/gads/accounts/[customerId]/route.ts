import { getUserId } from "@/lib/get-user-id";
import { removeGadsAccount } from "@/lib/tokens";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { customerId } = await params;
  removeGadsAccount(userId, customerId);
  return Response.json({ success: true });
}
