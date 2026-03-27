// @vitest-environment node
import { describe, it, expect } from "vitest";
import { mapCampaign, mapAdGroup, mapAd, mapObjective, mapFullCampaign, countMappingResults } from "@/lib/oai/mapper";
import type { GadsCampaign, GadsAdGroup, GadsAd } from "@/lib/types";

const mockCampaign: GadsCampaign = {
  id: "123", name: "Summer Sale 2026", status: "ENABLED", advertisingChannelType: "SEARCH",
  biddingStrategyType: "TARGET_CPA",
  budget: { amountMicros: 50_000_000, totalAmountMicros: undefined, deliveryMethod: "STANDARD", period: "DAILY" },
  networkSettings: { targetGoogleSearch: true, targetSearchNetwork: true, targetContentNetwork: false, targetPartnerSearchNetwork: false },
  geoTargetTypeSetting: { positiveGeoTargetType: "PRESENCE_OR_INTEREST", negativeGeoTargetType: "PRESENCE" },
  startDate: "2026-06-01", endDate: "2026-08-31", accountId: "456", accountName: "Test Account",
};

const mockAdGroup: GadsAdGroup = {
  id: "789", campaignId: "123", name: "Brand Keywords", status: "ENABLED",
  type: "SEARCH_STANDARD", cpcBidMicros: 2_000_000, targetCpaMicros: 10_000_000,
};

const mockAd: GadsAd = {
  id: "101", adGroupId: "789", type: "RESPONSIVE_SEARCH_AD",
  headlines: ["Summer Deals", "Shop Now", "Best Prices"],
  descriptions: ["Get the best summer deals on all products.", "Free shipping on orders over $50."],
  finalUrls: ["https://example.com/summer"],
};

describe("mapObjective", () => {
  it("maps TARGET_CPA to CONVERSIONS", () => { expect(mapObjective("TARGET_CPA")).toBe("CONVERSIONS"); });
  it("maps MAXIMIZE_CONVERSIONS to CONVERSIONS", () => { expect(mapObjective("MAXIMIZE_CONVERSIONS")).toBe("CONVERSIONS"); });
  it("maps TARGET_ROAS to CONVERSIONS", () => { expect(mapObjective("TARGET_ROAS")).toBe("CONVERSIONS"); });
  it("maps MAXIMIZE_CONVERSION_VALUE to CONVERSIONS", () => { expect(mapObjective("MAXIMIZE_CONVERSION_VALUE")).toBe("CONVERSIONS"); });
  it("maps TARGET_IMPRESSION_SHARE to AWARENESS", () => { expect(mapObjective("TARGET_IMPRESSION_SHARE")).toBe("AWARENESS"); });
  it("maps MANUAL_CPC to TRAFFIC", () => { expect(mapObjective("MANUAL_CPC")).toBe("TRAFFIC"); });
  it("maps TARGET_SPEND to TRAFFIC", () => { expect(mapObjective("TARGET_SPEND")).toBe("TRAFFIC"); });
  it("maps MANUAL_CPM to AWARENESS", () => { expect(mapObjective("MANUAL_CPM")).toBe("AWARENESS"); });
  it("maps MANUAL_CPV to CONSIDERATION", () => { expect(mapObjective("MANUAL_CPV")).toBe("CONSIDERATION"); });
  it("maps unknown to TRAFFIC as default", () => { expect(mapObjective("UNKNOWN_STRATEGY")).toBe("TRAFFIC"); });
});

describe("mapCampaign", () => {
  it("maps GAds campaign to OAI campaign fields", () => {
    const result = mapCampaign(mockCampaign);
    expect(result.name).toBe("Summer Sale 2026");
    expect(result.objective).toBe("CONVERSIONS");
    expect(result.status).toBe("DRAFT");
    expect(result.budget.daily_amount).toBe(50);
    expect(result.budget.total_amount).toBeUndefined();
    expect(result.schedule.start_date).toBe("2026-06-01");
    expect(result.schedule.end_date).toBe("2026-08-31");
  });
});

describe("mapAdGroup", () => {
  it("maps GAds ad group to OAI ad set", () => {
    const result = mapAdGroup(mockAdGroup);
    expect(result.name).toBe("Brand Keywords");
    expect(result.status).toBe("DRAFT");
    expect(result.bidding.strategy).toBe("TARGET_CPA");
    expect(result.bidding.target_cpa).toBe(10);
    expect(result.targeting.topic_clusters).toEqual([]);
    expect(result.targeting.intent_signals).toEqual([]);
    expect(result.targeting.devices).toEqual(["MOBILE", "DESKTOP"]);
    expect(result.targeting.conversation_depth).toBe("ANY");
    expect(result.attribution.click_window).toBe("7_DAY");
    expect(result.attribution.view_window).toBe("1_DAY");
    expect(result.attribution.model).toBe("LAST_CLICK");
  });
  it("defaults to CPM strategy when no CPA set", () => {
    const adGroup: GadsAdGroup = { ...mockAdGroup, targetCpaMicros: undefined, cpcBidMicros: 1_000_000 };
    const result = mapAdGroup(adGroup);
    expect(result.bidding.strategy).toBe("CPM");
    expect(result.bidding.cpm_amount).toBe(60);
  });
});

describe("mapAd", () => {
  it("maps GAds ad to OAI creative", () => {
    const result = mapAd(mockAd);
    expect(result.headline).toBe("Summer Deals");
    expect(result.description).toBe("Get the best summer deals on all products.");
    expect(result.destination_url).toBe("https://example.com/summer");
    expect(result.format).toBe("SPONSORED_CARD");
  });
  it("truncates headline to 60 chars", () => {
    const longAd: GadsAd = { ...mockAd, headlines: ["A".repeat(100)] };
    expect(mapAd(longAd).headline.length).toBe(60);
  });
  it("truncates description to 180 chars", () => {
    const longAd: GadsAd = { ...mockAd, descriptions: ["B".repeat(200)] };
    expect(mapAd(longAd).description.length).toBe(180);
  });
});

describe("mapFullCampaign", () => {
  it("maps full campaign with ad groups and ads", () => {
    const result = mapFullCampaign(mockCampaign, [mockAdGroup], { [mockAdGroup.id]: [mockAd] });
    expect(result.name).toBe("Summer Sale 2026");
    expect(result.ad_sets).toHaveLength(1);
    expect(result.ad_sets[0].name).toBe("Brand Keywords");
    expect(result.ad_sets[0].creatives).toHaveLength(1);
    expect(result.ad_sets[0].creatives[0].headline).toBe("Summer Deals");
  });
  it("maps campaign-only when no ad groups provided", () => {
    const result = mapFullCampaign(mockCampaign, [], {});
    expect(result.ad_sets).toEqual([]);
  });
});

describe("countMappingResults", () => {
  it("counts auto-mapped and action-needed fields", () => {
    const draft = mapFullCampaign(mockCampaign, [mockAdGroup], { [mockAdGroup.id]: [mockAd] });
    const counts = countMappingResults(draft);
    expect(counts.mapped).toBeGreaterThan(0);
    expect(counts.actionNeeded).toBeGreaterThan(0);
  });
});
