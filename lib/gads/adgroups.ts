import type { GadsAdGroup, GadsAccount } from "@/lib/types";
import { createGadsClient } from "./client";
import { MOCK_AD_GROUPS } from "./mock-data";

/* ------------------------------------------------------------------ */
/*  Enum maps                                                         */
/* ------------------------------------------------------------------ */

const AD_GROUP_STATUS_MAP: Record<number, GadsAdGroup["status"]> = {
  2: "ENABLED",
  3: "PAUSED",
  4: "REMOVED",
};

const AD_GROUP_TYPE_MAP: Record<number, string> = {
  2: "SEARCH_STANDARD",
  3: "DISPLAY_STANDARD",
  6: "SHOPPING_PRODUCT_ADS",
  7: "HOTEL_ADS",
  8: "SHOPPING_SMART_ADS",
  9: "VIDEO_BUMPER",
  10: "VIDEO_TRUE_VIEW_IN_STREAM",
  11: "VIDEO_TRUE_VIEW_IN_DISPLAY",
  12: "VIDEO_NON_SKIPPABLE_IN_STREAM",
  13: "VIDEO_OUTSTREAM",
  14: "SEARCH_DYNAMIC_ADS",
  15: "SHOPPING_COMPARISON_LISTING_ADS",
  17: "VIDEO_RESPONSIVE",
  19: "SMART_CAMPAIGN_ADS",
  21: "VIDEO_EFFICIENT_REACH",
  25: "TRAVEL_ADS",
};

/* ------------------------------------------------------------------ */
/*  Transform                                                         */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformAdGroup(raw: any): GadsAdGroup {
  const ag = raw.ad_group;

  return {
    id: String(ag.id),
    campaignId: String(ag.campaign?.split("/").pop() ?? ""),
    name: ag.name,
    status: AD_GROUP_STATUS_MAP[ag.status] ?? "REMOVED",
    type: AD_GROUP_TYPE_MAP[ag.type] ?? "UNKNOWN",
    ...(ag.cpc_bid_micros ? { cpcBidMicros: Number(ag.cpc_bid_micros) } : {}),
    ...(ag.cpm_bid_micros ? { cpmBidMicros: Number(ag.cpm_bid_micros) } : {}),
    ...(ag.cpv_bid_micros ? { cpvBidMicros: Number(ag.cpv_bid_micros) } : {}),
    ...(ag.target_cpa_micros
      ? { targetCpaMicros: Number(ag.target_cpa_micros) }
      : {}),
    ...(ag.target_roas ? { targetRoas: Number(ag.target_roas) } : {}),
  };
}

/* ------------------------------------------------------------------ */
/*  Fetch                                                             */
/* ------------------------------------------------------------------ */

const AD_GROUP_QUERY = `
  SELECT
    ad_group.id,
    ad_group.name,
    ad_group.status,
    ad_group.type,
    ad_group.campaign,
    ad_group.cpc_bid_micros,
    ad_group.cpm_bid_micros,
    ad_group.cpv_bid_micros,
    ad_group.target_cpa_micros,
    ad_group.target_roas
  FROM ad_group
  WHERE ad_group.status != 'REMOVED'
    AND campaign.id = :campaignId
`;

export async function fetchAdGroups(
  campaignId: string,
  accounts: GadsAccount[],
): Promise<GadsAdGroup[]> {
  if (process.env.USE_MOCK_DATA === "true") {
    return MOCK_AD_GROUPS.filter((ag) => ag.campaignId === campaignId);
  }

  const client = createGadsClient();
  const allAdGroups: GadsAdGroup[] = [];

  for (const account of accounts) {
    const customer = client.Customer({
      customer_id: account.customerId,
      refresh_token: account.refreshToken,
    });

    const query = AD_GROUP_QUERY.replace(":campaignId", campaignId);
    const rows = await customer.query(query);

    for (const row of rows) {
      allAdGroups.push(transformAdGroup(row));
    }
  }

  return allAdGroups;
}
