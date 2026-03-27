import type { GadsAd, GadsAccount } from "@/lib/types";
import { createGadsClient } from "./client";
import { MOCK_ADS } from "./mock-data";

/* ------------------------------------------------------------------ */
/*  Enum maps                                                         */
/* ------------------------------------------------------------------ */

const AD_TYPE_MAP: Record<number, string> = {
  2: "TEXT_AD",
  3: "EXPANDED_TEXT_AD",
  6: "RESPONSIVE_DISPLAY_AD",
  7: "CALL_AD",
  11: "EXPANDED_DYNAMIC_SEARCH_AD",
  12: "HOTEL_AD",
  13: "SHOPPING_SMART_AD",
  14: "SHOPPING_PRODUCT_AD",
  15: "RESPONSIVE_SEARCH_AD",
  16: "LEGACY_RESPONSIVE_DISPLAY_AD",
  17: "APP_AD",
  18: "LEGACY_APP_INSTALL_AD",
  22: "IMAGE_AD",
  23: "VIDEO_AD",
  24: "VIDEO_RESPONSIVE_AD",
  25: "LOCAL_AD",
  27: "SMART_CAMPAIGN_AD",
  35: "DEMAND_GEN_PRODUCT_AD",
  39: "DEMAND_GEN_MULTI_ASSET_AD",
  40: "DEMAND_GEN_CAROUSEL_AD",
  41: "DEMAND_GEN_VIDEO_RESPONSIVE_AD",
};

/* ------------------------------------------------------------------ */
/*  Transform                                                         */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformAd(raw: any): GadsAd {
  const agAd = raw.ad_group_ad;
  const ad = agAd.ad;

  return {
    id: String(ad.id),
    adGroupId: String(agAd.ad_group?.split("/").pop() ?? ""),
    type: AD_TYPE_MAP[ad.type] ?? "UNKNOWN",
    headlines: (ad.responsive_search_ad?.headlines ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (h: any) => h.text,
    ),
    descriptions: (ad.responsive_search_ad?.descriptions ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (d: any) => d.text,
    ),
    finalUrls: ad.final_urls ?? [],
    ...(ad.final_mobile_urls?.length
      ? { finalMobileUrls: ad.final_mobile_urls }
      : {}),
    ...(ad.responsive_search_ad?.path1
      ? { path1: ad.responsive_search_ad.path1 }
      : {}),
    ...(ad.responsive_search_ad?.path2
      ? { path2: ad.responsive_search_ad.path2 }
      : {}),
    ...(ad.tracking_url_template
      ? { trackingUrlTemplate: ad.tracking_url_template }
      : {}),
  };
}

/* ------------------------------------------------------------------ */
/*  Fetch                                                             */
/* ------------------------------------------------------------------ */

const AD_QUERY = `
  SELECT
    ad_group_ad.ad.id,
    ad_group_ad.ad.type,
    ad_group_ad.ad.final_urls,
    ad_group_ad.ad.final_mobile_urls,
    ad_group_ad.ad.tracking_url_template,
    ad_group_ad.ad.responsive_search_ad.headlines,
    ad_group_ad.ad.responsive_search_ad.descriptions,
    ad_group_ad.ad.responsive_search_ad.path1,
    ad_group_ad.ad.responsive_search_ad.path2,
    ad_group_ad.ad_group
  FROM ad_group_ad
  WHERE ad_group_ad.status != 'REMOVED'
    AND ad_group.id = :adGroupId
`;

export async function fetchAds(
  adGroupId: string,
  accounts: GadsAccount[],
): Promise<GadsAd[]> {
  if (process.env.USE_MOCK_DATA === "true") {
    return MOCK_ADS.filter((ad) => ad.adGroupId === adGroupId);
  }

  const client = createGadsClient();
  const allAds: GadsAd[] = [];

  for (const account of accounts) {
    const customer = client.Customer({
      customer_id: account.customerId,
      refresh_token: account.refreshToken,
    });

    const query = AD_QUERY.replace(":adGroupId", adGroupId);
    const rows = await customer.query(query);

    for (const row of rows) {
      allAds.push(transformAd(row));
    }
  }

  return allAds;
}
