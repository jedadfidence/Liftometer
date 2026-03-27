import type { GadsCampaign, GadsAccount } from "@/lib/types";
import { createGadsClient } from "./client";
import { MOCK_CAMPAIGNS } from "./mock-data";

/* ------------------------------------------------------------------ */
/*  Enum maps for transforming raw GAds API numeric values to strings  */
/* ------------------------------------------------------------------ */

const CAMPAIGN_STATUS_MAP: Record<number, GadsCampaign["status"]> = {
  2: "ENABLED",
  3: "PAUSED",
  4: "REMOVED",
};

const CHANNEL_TYPE_MAP: Record<number, string> = {
  2: "SEARCH",
  3: "DISPLAY",
  6: "SHOPPING",
  7: "VIDEO",
  8: "MULTI_CHANNEL",
  9: "LOCAL",
  10: "SMART",
  11: "PERFORMANCE_MAX",
  12: "LOCAL_SERVICES",
  13: "DISCOVERY",
  15: "TRAVEL",
  16: "DEMAND_GEN",
};

const BIDDING_STRATEGY_MAP: Record<number, string> = {
  2: "MANUAL_CPC",
  3: "MANUAL_CPV",
  4: "MANUAL_CPM",
  6: "TARGET_CPA",
  7: "MAXIMIZE_CONVERSIONS",
  8: "MAXIMIZE_CONVERSION_VALUE",
  9: "TARGET_ROAS",
  10: "TARGET_SPEND",
  11: "PERCENT_CPC",
  12: "TARGET_IMPRESSION_SHARE",
};

const DELIVERY_METHOD_MAP: Record<number, string> = {
  2: "STANDARD",
  3: "ACCELERATED",
};

const BUDGET_PERIOD_MAP: Record<number, string> = {
  2: "DAILY",
  3: "CUSTOM_PERIOD",
};

const POSITIVE_GEO_MAP: Record<number, string> = {
  2: "PRESENCE_OR_INTEREST",
  3: "SEARCH_INTEREST",
  4: "PRESENCE",
};

const NEGATIVE_GEO_MAP: Record<number, string> = {
  2: "PRESENCE_OR_INTEREST",
  5: "PRESENCE",
};

/* ------------------------------------------------------------------ */
/*  Transform a raw GAds API row into our GadsCampaign type           */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformCampaign(
  raw: any,
  accountId: string,
  accountName: string,
): GadsCampaign {
  const c = raw.campaign;
  const b = raw.campaign_budget;

  return {
    id: String(c.id),
    name: c.name,
    status: CAMPAIGN_STATUS_MAP[c.status] ?? "REMOVED",
    advertisingChannelType:
      CHANNEL_TYPE_MAP[c.advertising_channel_type] ?? "UNKNOWN",
    biddingStrategyType:
      BIDDING_STRATEGY_MAP[c.bidding_strategy_type] ?? "UNKNOWN",
    budget: {
      amountMicros: Number(b.amount_micros),
      ...(b.total_amount_micros
        ? { totalAmountMicros: Number(b.total_amount_micros) }
        : {}),
      deliveryMethod: DELIVERY_METHOD_MAP[b.delivery_method] ?? "STANDARD",
      period: BUDGET_PERIOD_MAP[b.period] ?? "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: c.network_settings?.target_google_search ?? false,
      targetSearchNetwork: c.network_settings?.target_search_network ?? false,
      targetContentNetwork:
        c.network_settings?.target_content_network ?? false,
      targetPartnerSearchNetwork:
        c.network_settings?.target_partner_search_network ?? false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType:
        POSITIVE_GEO_MAP[c.geo_target_type_setting?.positive_geo_target_type] ??
        "PRESENCE_OR_INTEREST",
      negativeGeoTargetType:
        NEGATIVE_GEO_MAP[c.geo_target_type_setting?.negative_geo_target_type] ??
        "PRESENCE",
    },
    ...(c.start_date ? { startDate: c.start_date } : {}),
    ...(c.end_date ? { endDate: c.end_date } : {}),
    ...(c.tracking_url_template
      ? { trackingUrlTemplate: c.tracking_url_template }
      : {}),
    ...(c.final_url_suffix ? { finalUrlSuffix: c.final_url_suffix } : {}),
    ...(c.url_expansion_opt_out !== undefined
      ? { urlExpansionOptOut: c.url_expansion_opt_out }
      : {}),
    accountId,
    accountName,
  };
}

/* ------------------------------------------------------------------ */
/*  Fetch campaigns (mock or real)                                    */
/* ------------------------------------------------------------------ */

const CAMPAIGN_QUERY = `
  SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    campaign.advertising_channel_type,
    campaign.bidding_strategy_type,
    campaign.network_settings.target_google_search,
    campaign.network_settings.target_search_network,
    campaign.network_settings.target_content_network,
    campaign.network_settings.target_partner_search_network,
    campaign.geo_target_type_setting.positive_geo_target_type,
    campaign.geo_target_type_setting.negative_geo_target_type,
    campaign.start_date,
    campaign.end_date,
    campaign.tracking_url_template,
    campaign.final_url_suffix,
    campaign.url_expansion_opt_out,
    campaign_budget.amount_micros,
    campaign_budget.total_amount_micros,
    campaign_budget.delivery_method,
    campaign_budget.period
  FROM campaign
  WHERE campaign.status != 'REMOVED'
`;

export async function fetchCampaigns(
  accounts: GadsAccount[],
): Promise<GadsCampaign[]> {
  if (process.env.USE_MOCK_DATA === "true") {
    return MOCK_CAMPAIGNS;
  }

  const client = createGadsClient();
  const allCampaigns: GadsCampaign[] = [];

  for (const account of accounts) {
    const customer = client.Customer({
      customer_id: account.customerId,
      refresh_token: account.refreshToken,
    });

    const rows = await customer.query(CAMPAIGN_QUERY);

    for (const row of rows) {
      allCampaigns.push(
        transformCampaign(row, account.customerId, account.name),
      );
    }
  }

  return allCampaigns;
}

export async function fetchCampaignById(
  campaignId: string,
  accounts: GadsAccount[],
): Promise<GadsCampaign | null> {
  if (process.env.USE_MOCK_DATA === "true") {
    return MOCK_CAMPAIGNS.find((c) => c.id === campaignId) ?? null;
  }

  const campaigns = await fetchCampaigns(accounts);
  return campaigns.find((c) => c.id === campaignId) ?? null;
}
