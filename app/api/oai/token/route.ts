import { getUserId } from "@/lib/get-user-id";
import { setOaiToken, getOaiToken } from "@/lib/tokens";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = getOaiToken(userId);
  return Response.json({ hasToken: !!token });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { token } = await request.json();
  setOaiToken(userId, token);
  return Response.json({ success: true });
}
