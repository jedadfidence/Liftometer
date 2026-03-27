import { auth } from "@/lib/auth";
import { setOaiToken, getOaiToken } from "@/lib/tokens";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = getOaiToken(session.user.id);
  return Response.json({ hasToken: !!token });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { token } = await request.json();
  setOaiToken(session.user.id, token);
  return Response.json({ success: true });
}
