// @vitest-environment node
import { describe, it, expect } from "vitest";
import { transformCampaign } from "@/lib/gads/campaigns";

describe("transformCampaign", () => {
  it("transforms raw GAds API response to GadsCampaign", () => {
    const raw = {
      campaign: {
        id: "123",
        name: "Test Campaign",
        status: 2, // ENABLED
        advertising_channel_type: 2, // SEARCH
        bidding_strategy_type: 6, // TARGET_CPA
        network_settings: {
          target_google_search: true,
          target_search_network: false,
          target_content_network: false,
          target_partner_search_network: false,
        },
        geo_target_type_setting: {
          positive_geo_target_type: 2,
          negative_geo_target_type: 5,
        },
        start_date: "2026-06-01",
        end_date: "2026-08-31",
      },
      campaign_budget: {
        amount_micros: "50000000",
        delivery_method: 2,
        period: 2,
      },
    };

    const result = transformCampaign(raw, "456", "Test Account");

    expect(result.id).toBe("123");
    expect(result.name).toBe("Test Campaign");
    expect(result.status).toBe("ENABLED");
    expect(result.advertisingChannelType).toBe("SEARCH");
    expect(result.biddingStrategyType).toBe("TARGET_CPA");
    expect(result.budget.amountMicros).toBe(50000000);
    expect(result.budget.deliveryMethod).toBe("STANDARD");
    expect(result.budget.period).toBe("DAILY");
    expect(result.networkSettings.targetGoogleSearch).toBe(true);
    expect(result.networkSettings.targetSearchNetwork).toBe(false);
    expect(result.geoTargetTypeSetting.positiveGeoTargetType).toBe(
      "PRESENCE_OR_INTEREST",
    );
    expect(result.geoTargetTypeSetting.negativeGeoTargetType).toBe("PRESENCE");
    expect(result.startDate).toBe("2026-06-01");
    expect(result.endDate).toBe("2026-08-31");
    expect(result.accountId).toBe("456");
    expect(result.accountName).toBe("Test Account");
  });

  it("handles missing optional fields", () => {
    const raw = {
      campaign: {
        id: "999",
        name: "Minimal Campaign",
        status: 3, // PAUSED
        advertising_channel_type: 3, // DISPLAY
        bidding_strategy_type: 7, // MAXIMIZE_CONVERSIONS
        network_settings: {
          target_google_search: false,
          target_search_network: false,
          target_content_network: true,
          target_partner_search_network: false,
        },
        geo_target_type_setting: {
          positive_geo_target_type: 4,
          negative_geo_target_type: 5,
        },
      },
      campaign_budget: {
        amount_micros: "10000000",
        delivery_method: 2,
        period: 2,
      },
    };

    const result = transformCampaign(raw, "789", "Minimal Account");

    expect(result.id).toBe("999");
    expect(result.status).toBe("PAUSED");
    expect(result.advertisingChannelType).toBe("DISPLAY");
    expect(result.startDate).toBeUndefined();
    expect(result.endDate).toBeUndefined();
    expect(result.trackingUrlTemplate).toBeUndefined();
    expect(result.geoTargetTypeSetting.positiveGeoTargetType).toBe("PRESENCE");
  });

  it("handles unknown enum values gracefully", () => {
    const raw = {
      campaign: {
        id: "888",
        name: "Unknown Enums",
        status: 999,
        advertising_channel_type: 999,
        bidding_strategy_type: 999,
        network_settings: {},
        geo_target_type_setting: {},
      },
      campaign_budget: {
        amount_micros: "5000000",
        delivery_method: 999,
        period: 999,
      },
    };

    const result = transformCampaign(raw, "000", "Unknown Account");

    expect(result.status).toBe("REMOVED");
    expect(result.advertisingChannelType).toBe("UNKNOWN");
    expect(result.biddingStrategyType).toBe("UNKNOWN");
    expect(result.budget.deliveryMethod).toBe("STANDARD");
    expect(result.budget.period).toBe("DAILY");
  });
});
