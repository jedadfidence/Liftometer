import { getUserId } from "@/lib/get-user-id";
import { createOAIDraft } from "@/lib/oai/stub";
import type { OAICampaignDraft } from "@/lib/types";

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const draft: OAICampaignDraft = await request.json();
  const result = await createOAIDraft(draft);
  return Response.json(result);
}
