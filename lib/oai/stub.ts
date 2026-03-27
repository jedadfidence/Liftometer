import type { OAICampaignDraft, OAICloneResponse } from "@/lib/types";

export async function createOAIDraft(draft: OAICampaignDraft): Promise<OAICloneResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
  const warnings: string[] = [];
  for (const adSet of draft.ad_sets) {
    if (adSet.targeting.topic_clusters.length === 0) warnings.push(`Topic clusters not set for Ad Set "${adSet.name}"`);
    if (adSet.targeting.intent_signals.length === 0) warnings.push(`Intent signals not set for Ad Set "${adSet.name}"`);
    for (const creative of adSet.creatives) {
      if (!creative.headline) warnings.push(`Headline missing for a creative in Ad Set "${adSet.name}"`);
      if (!creative.description) warnings.push(`Description missing for a creative in Ad Set "${adSet.name}"`);
    }
  }
  const totalCreatives = draft.ad_sets.reduce((sum, as) => sum + as.creatives.length, 0);
  return {
    draft_id: crypto.randomUUID(),
    campaign_name: draft.name,
    status: "DRAFT",
    created_at: new Date().toISOString(),
    ad_sets_count: draft.ad_sets.length,
    creatives_count: totalCreatives,
    warnings,
  };
}
