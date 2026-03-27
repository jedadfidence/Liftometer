import type { GadsCampaign, GadsAdGroup, GadsAd, OAICampaignDraft, OAIAdSet, OAICreative, OAIObjective, OAIBiddingStrategy } from "@/lib/types";
import { microsToUsd, truncate } from "@/lib/utils";

const OBJECTIVE_MAP: Record<string, OAIObjective> = {
  MAXIMIZE_CONVERSIONS: "CONVERSIONS", TARGET_CPA: "CONVERSIONS",
  MAXIMIZE_CONVERSION_VALUE: "CONVERSIONS", TARGET_ROAS: "CONVERSIONS",
  TARGET_IMPRESSION_SHARE: "AWARENESS", MANUAL_CPC: "TRAFFIC", TARGET_SPEND: "TRAFFIC",
  MANUAL_CPM: "AWARENESS", MANUAL_CPV: "CONSIDERATION",
};

export function mapObjective(biddingStrategyType: string): OAIObjective {
  return OBJECTIVE_MAP[biddingStrategyType] ?? "TRAFFIC";
}

export function mapCampaign(campaign: GadsCampaign): Omit<OAICampaignDraft, "ad_sets"> {
  return {
    name: campaign.name,
    objective: mapObjective(campaign.biddingStrategyType),
    status: "DRAFT",
    budget: {
      daily_amount: microsToUsd(campaign.budget.amountMicros),
      total_amount: campaign.budget.totalAmountMicros ? microsToUsd(campaign.budget.totalAmountMicros) : undefined,
    },
    schedule: {
      start_date: campaign.startDate ?? new Date().toISOString().split("T")[0],
      end_date: campaign.endDate,
    },
  };
}

export function mapAdGroup(adGroup: GadsAdGroup): Omit<OAIAdSet, "creatives"> {
  const hasTargetCpa = adGroup.targetCpaMicros !== undefined && adGroup.targetCpaMicros > 0;
  const strategy: OAIBiddingStrategy = hasTargetCpa ? "TARGET_CPA" : "CPM";
  return {
    name: adGroup.name, status: "DRAFT",
    bidding: { strategy, cpm_amount: strategy === "CPM" ? 60 : undefined, target_cpa: hasTargetCpa ? microsToUsd(adGroup.targetCpaMicros) : undefined },
    targeting: { topic_clusters: [], intent_signals: [], locations: [], languages: [], devices: ["MOBILE", "DESKTOP"], conversation_depth: "ANY" },
    attribution: { click_window: "7_DAY", view_window: "1_DAY", model: "LAST_CLICK" },
  };
}

export function mapAd(ad: GadsAd): OAICreative {
  return {
    headline: truncate(ad.headlines[0] ?? "", 60),
    description: truncate(ad.descriptions[0] ?? "", 180),
    destination_url: ad.finalUrls[0] ?? "",
    format: "SPONSORED_CARD",
  };
}

export function mapFullCampaign(campaign: GadsCampaign, adGroups: GadsAdGroup[], adsByAdGroup: Record<string, GadsAd[]>): OAICampaignDraft {
  const mapped = mapCampaign(campaign);
  const adSets: OAIAdSet[] = adGroups.map((ag) => {
    const adSetBase = mapAdGroup(ag);
    const ads = adsByAdGroup[ag.id] ?? [];
    return { ...adSetBase, creatives: ads.map(mapAd) };
  });
  return { ...mapped, ad_sets: adSets };
}

export function countMappingResults(draft: OAICampaignDraft): { mapped: number; actionNeeded: number } {
  let mapped = 0; let actionNeeded = 0;
  mapped += 5; // name, objective, budget.daily, start_date, status
  if (draft.budget.total_amount) mapped++;
  if (draft.schedule.end_date) mapped++;
  for (const adSet of draft.ad_sets) {
    mapped += 7; actionNeeded += 2; // topic_clusters, intent_signals always need input
    if (adSet.bidding.cpm_amount) mapped++;
    if (adSet.bidding.target_cpa) mapped++;
    if (adSet.targeting.locations.length > 0) mapped++; else actionNeeded++;
    if (adSet.targeting.languages.length > 0) mapped++; else actionNeeded++;
    for (const creative of adSet.creatives) {
      if (creative.destination_url) mapped++;
      mapped++; // format
      if (creative.headline) mapped++; else actionNeeded++;
      if (creative.description) mapped++; else actionNeeded++;
    }
  }
  return { mapped, actionNeeded };
}
