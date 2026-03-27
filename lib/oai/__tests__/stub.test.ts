// @vitest-environment node
import { describe, it, expect } from "vitest";
import { createOAIDraft } from "@/lib/oai/stub";
import type { OAICampaignDraft } from "@/lib/types";

const mockDraft: OAICampaignDraft = {
  name: "Test Campaign", objective: "CONVERSIONS", status: "DRAFT",
  budget: { daily_amount: 50 }, schedule: { start_date: "2026-06-01" },
  ad_sets: [{
    name: "Ad Set 1", status: "DRAFT",
    bidding: { strategy: "CPM", cpm_amount: 60 },
    targeting: { topic_clusters: [], intent_signals: [], locations: ["US"], languages: ["en"], devices: ["MOBILE", "DESKTOP"], conversation_depth: "ANY" },
    attribution: { click_window: "7_DAY", view_window: "1_DAY", model: "LAST_CLICK" },
    creatives: [{ headline: "Test Headline", description: "Test Description", destination_url: "https://example.com", format: "SPONSORED_CARD" }],
  }],
};

describe("createOAIDraft", () => {
  it("returns a valid clone response", async () => {
    const result = await createOAIDraft(mockDraft);
    expect(result.draft_id).toBeDefined();
    expect(result.campaign_name).toBe("Test Campaign");
    expect(result.status).toBe("DRAFT");
    expect(result.created_at).toBeDefined();
    expect(result.ad_sets_count).toBe(1);
    expect(result.creatives_count).toBe(1);
  });
  it("returns warnings for empty topic clusters", async () => {
    const result = await createOAIDraft(mockDraft);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("Topic clusters");
  });
  it("returns no topic cluster warning when filled", async () => {
    const filledDraft: OAICampaignDraft = {
      ...mockDraft,
      ad_sets: [{ ...mockDraft.ad_sets[0], targeting: { ...mockDraft.ad_sets[0].targeting, topic_clusters: ["shopping"], intent_signals: ["purchase"] } }],
    };
    const result = await createOAIDraft(filledDraft);
    const topicWarnings = result.warnings.filter((w) => w.includes("Topic clusters"));
    expect(topicWarnings).toHaveLength(0);
  });
}, 10000);
