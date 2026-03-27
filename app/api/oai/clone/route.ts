import { auth } from "@/lib/auth";
import { createOAIDraft } from "@/lib/oai/stub";
import type { OAICampaignDraft } from "@/lib/types";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const draft: OAICampaignDraft = await request.json();
  const result = await createOAIDraft(draft);
  return Response.json(result);
}
