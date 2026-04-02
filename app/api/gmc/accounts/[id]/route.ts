import { getUserId } from "@/lib/get-user-id";
import { removeGmcAccount } from "@/lib/tokens";
import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  removeGmcAccount(userId, id);
  return Response.json({ success: true });
}
