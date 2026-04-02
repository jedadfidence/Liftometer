import { getUserId } from "@/lib/get-user-id";
import {
  setOaiMcToken,
  getOaiMcConnection,
  removeOaiMcConnection,
} from "@/lib/tokens";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const connection = getOaiMcConnection(userId);
  if (!connection) {
    return Response.json({ hasToken: false });
  }
  return Response.json({
    hasToken: true,
    name: connection.name,
    maskedId: connection.maskedId,
  });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { token, name } = await request.json();
  setOaiMcToken(userId, token, name);
  return Response.json({ success: true });
}

export async function DELETE() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  removeOaiMcConnection(userId);
  return Response.json({ success: true });
}
