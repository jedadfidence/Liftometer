import { NextResponse } from "next/server";
import { getUserId } from "@/lib/get-user-id";
import { getActivity } from "@/lib/tokens";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const activity = getActivity(userId);
  return NextResponse.json({ activity });
}
