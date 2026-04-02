import { getUserId } from "@/lib/get-user-id";
import { addActivity } from "@/lib/tokens";
import type { OaiMcProductDraft } from "@/lib/types/gmc";

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { source_product_id, with_campaign, ...draftFields } = body;
  const draft: OaiMcProductDraft = draftFields;

  // Stub: simulate draft creation (will use real API later)
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));

  const warnings: string[] = [];
  if (!draft.title) warnings.push("Product title is missing");
  if (!draft.description) warnings.push("Product description is missing");
  if (!draft.imageLink) warnings.push("Product image is missing");

  const result = {
    draft_id: crypto.randomUUID(),
    product_title: draft.title,
    status: "DRAFT" as const,
    created_at: new Date().toISOString(),
    warnings,
  };

  addActivity(userId, {
    campaignName: draft.title,
    campaignId: source_product_id,
    action: with_campaign ? "product_copied_with_campaign" : "product_copied",
  });

  return Response.json(result);
}
