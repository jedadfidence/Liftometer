export type OAIObjective = "AWARENESS" | "CONSIDERATION" | "TRAFFIC" | "CONVERSIONS" | "ENGAGEMENT";
export type OAIBiddingStrategy = "CPM" | "TARGET_CPA" | "MAXIMIZE_CONVERSIONS";
export type OAIDevice = "MOBILE" | "DESKTOP";
export type OAIConversationDepth = "ANY" | "EARLY" | "DEEP";
export type OAIAttributionWindow = "1_DAY" | "7_DAY" | "28_DAY";
export type OAIAttributionModel = "LAST_CLICK" | "POSITION_BASED" | "TIME_DECAY";
export type OAICreativeFormat = "SPONSORED_CARD" | "PRODUCT_SPOTLIGHT" | "CONTEXTUAL_SIDEBAR";

export interface OAICampaignDraft {
  name: string;
  objective: OAIObjective;
  status: "DRAFT";
  budget: { daily_amount: number; total_amount?: number; };
  schedule: { start_date: string; end_date?: string; };
  ad_sets: OAIAdSet[];
}

export interface OAIAdSet {
  name: string;
  status: "DRAFT";
  bidding: { strategy: OAIBiddingStrategy; cpm_amount?: number; target_cpa?: number; };
  targeting: {
    topic_clusters: string[];
    intent_signals: string[];
    locations: string[];
    languages: string[];
    devices: OAIDevice[];
    conversation_depth: OAIConversationDepth;
  };
  attribution: {
    click_window: OAIAttributionWindow;
    view_window: OAIAttributionWindow;
    model: OAIAttributionModel;
  };
  creatives: OAICreative[];
}

export interface OAICreative {
  headline: string;
  description: string;
  destination_url: string;
  format: OAICreativeFormat;
}

export interface OAICloneResponse {
  draft_id: string;
  campaign_name: string;
  status: "DRAFT";
  created_at: string;
  ad_sets_count: number;
  creatives_count: number;
  warnings: string[];
}
