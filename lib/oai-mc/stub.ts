import type { OaiMcProductDraft, OaiMcCopyResponse } from "@/lib/types/gmc";

export async function createOaiMcDraft(draft: OaiMcProductDraft): Promise<OaiMcCopyResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));

  const warnings: string[] = [];
  if (!draft.title) warnings.push("Product title is missing");
  if (!draft.description) warnings.push("Product description is missing");
  if (!draft.imageLink) warnings.push("Product image is missing");

  return {
    draft_id: crypto.randomUUID(),
    product_title: draft.title,
    status: "DRAFT",
    created_at: new Date().toISOString(),
    warnings,
  };
}
