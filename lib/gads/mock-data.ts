import type { GadsCampaign, GadsAdGroup, GadsAd } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Accounts:
//   Acme Corp (123-456-7890)       — D2C e-commerce, home goods & fashion
//   Widget Inc (987-654-3210)      — B2B SaaS, project management tool
//   Greenleaf Dental (456-789-0123) — Local dental practice, multi-location
//   Nomad Roasters (321-654-9870)  — Specialty coffee e-commerce + retail
//   Pinnacle Fitness (555-123-4567) — Gym chain + online training platform
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_CAMPAIGNS: GadsCampaign[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ACME CORP — D2C E-Commerce
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "8374619250",
    name: "Summer Sale 2026",
    status: "ENABLED",
    advertisingChannelType: "SEARCH",
    biddingStrategyType: "TARGET_CPA",
    budget: {
      amountMicros: 50_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    trackingUrlTemplate:
      "https://tracking.acme.com?campaign={campaignid}&adgroup={adgroupid}",
    finalUrlSuffix: "utm_source=google&utm_medium=cpc&utm_campaign=summer_sale",
    accountId: "123-456-7890",
    accountName: "Acme Corp",
  },
  {
    id: "5029173846",
    name: "Brand Awareness Q3",
    status: "ENABLED",
    advertisingChannelType: "DISPLAY",
    biddingStrategyType: "TARGET_IMPRESSION_SHARE",
    budget: {
      amountMicros: 100_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    adServingOptimizationStatus: "OPTIMIZE",
    accountId: "123-456-7890",
    accountName: "Acme Corp",
  },
  {
    id: "6715028394",
    name: "Holiday Shopping 2026",
    status: "ENABLED",
    advertisingChannelType: "SHOPPING",
    biddingStrategyType: "TARGET_ROAS",
    budget: {
      amountMicros: 200_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    trackingUrlTemplate:
      "https://tracking.acme.com?campaign={campaignid}&product={productid}",
    accountId: "123-456-7890",
    accountName: "Acme Corp",
  },
  {
    id: "9451637280",
    name: "Performance Max - All Products",
    status: "ENABLED",
    advertisingChannelType: "PERFORMANCE_MAX",
    biddingStrategyType: "MAXIMIZE_CONVERSION_VALUE",
    budget: {
      amountMicros: 150_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-01-01",
    urlExpansionOptOut: false,
    accountId: "123-456-7890",
    accountName: "Acme Corp",
  },
  {
    id: "4263819075",
    name: "Retargeting - Cart Abandoners",
    status: "ENABLED",
    advertisingChannelType: "DISPLAY",
    biddingStrategyType: "TARGET_CPA",
    budget: {
      amountMicros: 40_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-02-01",
    trackingUrlTemplate:
      "https://tracking.acme.com?campaign={campaignid}&remarketing=true",
    accountId: "123-456-7890",
    accountName: "Acme Corp",
  },
  {
    id: "8194057326",
    name: "Demand Gen - Spring Collection",
    status: "PAUSED",
    advertisingChannelType: "DEMAND_GEN",
    biddingStrategyType: "MAXIMIZE_CONVERSION_VALUE",
    budget: {
      amountMicros: 120_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    accountId: "123-456-7890",
    accountName: "Acme Corp",
  },
  {
    id: "3850172694",
    name: "YouTube Pre-Roll - Brand Story",
    status: "ENABLED",
    advertisingChannelType: "VIDEO",
    biddingStrategyType: "MANUAL_CPM",
    budget: {
      amountMicros: 90_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-04-01",
    accountId: "123-456-7890",
    accountName: "Acme Corp",
  },
  {
    id: "1746389052",
    name: "Back to School 2026",
    status: "PAUSED",
    advertisingChannelType: "SHOPPING",
    biddingStrategyType: "TARGET_ROAS",
    budget: {
      amountMicros: 180_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-07-15",
    endDate: "2026-09-15",
    accountId: "123-456-7890",
    accountName: "Acme Corp",
  },
  {
    id: "4091625738",
    name: "Discovery - New Audiences",
    status: "REMOVED",
    advertisingChannelType: "DISCOVERY",
    biddingStrategyType: "MAXIMIZE_CONVERSIONS",
    budget: {
      amountMicros: 55_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2025-09-01",
    endDate: "2025-12-31",
    accountId: "123-456-7890",
    accountName: "Acme Corp",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WIDGET INC — B2B SaaS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "1948362057",
    name: "Product Launch - Widget Pro",
    status: "PAUSED",
    advertisingChannelType: "SEARCH",
    biddingStrategyType: "MAXIMIZE_CONVERSIONS",
    budget: {
      amountMicros: 75_000_000,
      totalAmountMicros: 2_250_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    finalUrlSuffix: "utm_source=google&utm_medium=cpc&utm_campaign=widget_pro_launch",
    accountId: "987-654-3210",
    accountName: "Widget Inc",
  },
  {
    id: "7580194362",
    name: "Lead Gen - Enterprise SaaS",
    status: "ENABLED",
    advertisingChannelType: "SEARCH",
    biddingStrategyType: "MAXIMIZE_CONVERSIONS",
    budget: {
      amountMicros: 250_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-01-15",
    trackingUrlTemplate:
      "https://tracking.widget.inc?campaign={campaignid}&source=google",
    finalUrlSuffix: "utm_source=google&utm_medium=cpc&utm_campaign=enterprise_leadgen",
    accountId: "987-654-3210",
    accountName: "Widget Inc",
  },
  {
    id: "3082947561",
    name: "Video Reach - Product Demo",
    status: "ENABLED",
    advertisingChannelType: "VIDEO",
    biddingStrategyType: "MANUAL_CPV",
    budget: {
      amountMicros: 30_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-06-15",
    accountId: "987-654-3210",
    accountName: "Widget Inc",
  },
  {
    id: "6927401835",
    name: "Competitor Conquest - Search",
    status: "ENABLED",
    advertisingChannelType: "SEARCH",
    biddingStrategyType: "MANUAL_CPC",
    budget: {
      amountMicros: 60_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-02-15",
    finalUrlSuffix: "utm_source=google&utm_medium=cpc&utm_campaign=competitor_conquest",
    accountId: "987-654-3210",
    accountName: "Widget Inc",
  },
  {
    id: "2637405918",
    name: "App Install - iOS & Android",
    status: "PAUSED",
    advertisingChannelType: "MULTI_CHANNEL",
    advertisingChannelSubType: "APP_CAMPAIGN",
    biddingStrategyType: "TARGET_CPA",
    budget: {
      amountMicros: 80_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    accountId: "987-654-3210",
    accountName: "Widget Inc",
  },
  {
    id: "5192038746",
    name: "Display Remarketing - Free Trial",
    status: "ENABLED",
    advertisingChannelType: "DISPLAY",
    biddingStrategyType: "TARGET_CPA",
    budget: {
      amountMicros: 35_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-03-01",
    trackingUrlTemplate:
      "https://tracking.widget.inc?campaign={campaignid}&remarketing=trial",
    accountId: "987-654-3210",
    accountName: "Widget Inc",
  },
  {
    id: "7213840569",
    name: "Performance Max - SaaS Signups",
    status: "ENABLED",
    advertisingChannelType: "PERFORMANCE_MAX",
    biddingStrategyType: "MAXIMIZE_CONVERSIONS",
    budget: {
      amountMicros: 175_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-02-01",
    urlExpansionOptOut: true,
    accountId: "987-654-3210",
    accountName: "Widget Inc",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GREENLEAF DENTAL — Local Practice
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "5308261947",
    name: "Local Services - Emergency Dental",
    status: "ENABLED",
    advertisingChannelType: "LOCAL_SERVICES",
    biddingStrategyType: "MANUAL_CPC",
    budget: {
      amountMicros: 25_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: false,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-01-01",
    accountId: "456-789-0123",
    accountName: "Greenleaf Dental",
  },
  {
    id: "6103827459",
    name: "New Patient Acquisition - Search",
    status: "ENABLED",
    advertisingChannelType: "SEARCH",
    biddingStrategyType: "TARGET_CPA",
    budget: {
      amountMicros: 45_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-01-15",
    trackingUrlTemplate:
      "https://greenleafdental.com/track?campaign={campaignid}&kw={keyword}",
    finalUrlSuffix: "utm_source=google&utm_medium=cpc&utm_campaign=new_patients",
    accountId: "456-789-0123",
    accountName: "Greenleaf Dental",
  },
  {
    id: "8472910365",
    name: "Invisalign Promo - Display",
    status: "ENABLED",
    advertisingChannelType: "DISPLAY",
    biddingStrategyType: "MAXIMIZE_CONVERSIONS",
    budget: {
      amountMicros: 30_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-03-01",
    endDate: "2026-06-30",
    adServingOptimizationStatus: "OPTIMIZE",
    accountId: "456-789-0123",
    accountName: "Greenleaf Dental",
  },
  {
    id: "2938471056",
    name: "Teeth Whitening - Seasonal Push",
    status: "PAUSED",
    advertisingChannelType: "SEARCH",
    biddingStrategyType: "MAXIMIZE_CONVERSIONS",
    budget: {
      amountMicros: 20_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: false,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    accountId: "456-789-0123",
    accountName: "Greenleaf Dental",
  },
  {
    id: "1057293846",
    name: "Performance Max - All Locations",
    status: "ENABLED",
    advertisingChannelType: "PERFORMANCE_MAX",
    biddingStrategyType: "MAXIMIZE_CONVERSIONS",
    budget: {
      amountMicros: 60_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-02-01",
    urlExpansionOptOut: false,
    accountId: "456-789-0123",
    accountName: "Greenleaf Dental",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NOMAD ROASTERS — Coffee E-Commerce + Retail
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "7391624058",
    name: "Brand Search - Nomad Roasters",
    status: "ENABLED",
    advertisingChannelType: "SEARCH",
    biddingStrategyType: "TARGET_IMPRESSION_SHARE",
    budget: {
      amountMicros: 15_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: false,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-01-01",
    finalUrlSuffix: "utm_source=google&utm_medium=cpc&utm_campaign=brand",
    accountId: "321-654-9870",
    accountName: "Nomad Roasters",
  },
  {
    id: "4826103957",
    name: "Coffee Subscriptions - Search",
    status: "ENABLED",
    advertisingChannelType: "SEARCH",
    biddingStrategyType: "TARGET_CPA",
    budget: {
      amountMicros: 55_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-02-01",
    trackingUrlTemplate:
      "https://nomadroasters.com/track?campaign={campaignid}&adgroup={adgroupid}",
    finalUrlSuffix: "utm_source=google&utm_medium=cpc&utm_campaign=subscriptions",
    accountId: "321-654-9870",
    accountName: "Nomad Roasters",
  },
  {
    id: "9174520836",
    name: "Shopping - Single Origin Beans",
    status: "ENABLED",
    advertisingChannelType: "SHOPPING",
    biddingStrategyType: "TARGET_ROAS",
    budget: {
      amountMicros: 40_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-01-15",
    accountId: "321-654-9870",
    accountName: "Nomad Roasters",
  },
  {
    id: "6285041739",
    name: "YouTube - Coffee Brewing Guides",
    status: "ENABLED",
    advertisingChannelType: "VIDEO",
    biddingStrategyType: "MANUAL_CPV",
    budget: {
      amountMicros: 20_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-03-01",
    accountId: "321-654-9870",
    accountName: "Nomad Roasters",
  },
  {
    id: "3618729405",
    name: "Demand Gen - Gift Sets Holiday",
    status: "PAUSED",
    advertisingChannelType: "DEMAND_GEN",
    biddingStrategyType: "MAXIMIZE_CONVERSION_VALUE",
    budget: {
      amountMicros: 85_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2025-11-01",
    endDate: "2025-12-25",
    accountId: "321-654-9870",
    accountName: "Nomad Roasters",
  },
  {
    id: "8043156279",
    name: "Performance Max - All Coffee",
    status: "ENABLED",
    advertisingChannelType: "PERFORMANCE_MAX",
    biddingStrategyType: "MAXIMIZE_CONVERSION_VALUE",
    budget: {
      amountMicros: 70_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-01-01",
    urlExpansionOptOut: false,
    accountId: "321-654-9870",
    accountName: "Nomad Roasters",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PINNACLE FITNESS — Gym Chain + Online Training
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "5827014936",
    name: "Gym Memberships - Search",
    status: "ENABLED",
    advertisingChannelType: "SEARCH",
    biddingStrategyType: "MAXIMIZE_CONVERSIONS",
    budget: {
      amountMicros: 100_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-01-01",
    trackingUrlTemplate:
      "https://tracking.pinnaclefitness.com?cid={campaignid}&gclid={gclid}",
    finalUrlSuffix: "utm_source=google&utm_medium=cpc&utm_campaign=memberships",
    accountId: "555-123-4567",
    accountName: "Pinnacle Fitness",
  },
  {
    id: "1694027385",
    name: "New Year Resolution - Jan Push",
    status: "PAUSED",
    advertisingChannelType: "SEARCH",
    biddingStrategyType: "TARGET_CPA",
    budget: {
      amountMicros: 200_000_000,
      totalAmountMicros: 6_200_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    finalUrlSuffix: "utm_source=google&utm_medium=cpc&utm_campaign=newyear",
    accountId: "555-123-4567",
    accountName: "Pinnacle Fitness",
  },
  {
    id: "4039281756",
    name: "Online Training - Display Prospecting",
    status: "ENABLED",
    advertisingChannelType: "DISPLAY",
    biddingStrategyType: "TARGET_CPA",
    budget: {
      amountMicros: 45_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-02-01",
    adServingOptimizationStatus: "OPTIMIZE",
    accountId: "555-123-4567",
    accountName: "Pinnacle Fitness",
  },
  {
    id: "7250493618",
    name: "YouTube - Transformation Stories",
    status: "ENABLED",
    advertisingChannelType: "VIDEO",
    biddingStrategyType: "MANUAL_CPV",
    budget: {
      amountMicros: 50_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: false,
      targetSearchNetwork: false,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE_OR_INTEREST",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-03-01",
    accountId: "555-123-4567",
    accountName: "Pinnacle Fitness",
  },
  {
    id: "9381620547",
    name: "Performance Max - All Locations",
    status: "ENABLED",
    advertisingChannelType: "PERFORMANCE_MAX",
    biddingStrategyType: "MAXIMIZE_CONVERSIONS",
    budget: {
      amountMicros: 130_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2026-01-15",
    urlExpansionOptOut: false,
    accountId: "555-123-4567",
    accountName: "Pinnacle Fitness",
  },
  {
    id: "2760841593",
    name: "Smart Campaign - Personal Training",
    status: "REMOVED",
    advertisingChannelType: "SMART",
    biddingStrategyType: "TARGET_SPEND",
    budget: {
      amountMicros: 15_000_000,
      deliveryMethod: "STANDARD",
      period: "DAILY",
    },
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    geoTargetTypeSetting: {
      positiveGeoTargetType: "PRESENCE",
      negativeGeoTargetType: "PRESENCE",
    },
    startDate: "2025-08-01",
    endDate: "2025-12-31",
    accountId: "555-123-4567",
    accountName: "Pinnacle Fitness",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AD GROUPS — every campaign gets 2–3 ad groups
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_AD_GROUPS: GadsAdGroup[] = [
  // ── Acme Corp: Summer Sale 2026 (Search) ───────────────────────────────
  {
    id: "ag-101",
    campaignId: "8374619250",
    name: "Brand Keywords",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 2_500_000,
    targetCpaMicros: 15_000_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-102",
    campaignId: "8374619250",
    name: "Generic - Summer Deals",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 3_000_000,
    targetCpaMicros: 20_000_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-103",
    campaignId: "8374619250",
    name: "Competitor Keywords",
    status: "PAUSED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 4_000_000,
    adRotationMode: "ROTATE_INDEFINITELY",
  },

  // ── Acme Corp: Brand Awareness Q3 (Display) ───────────────────────────
  {
    id: "ag-201",
    campaignId: "5029173846",
    name: "In-Market - Home & Garden",
    status: "ENABLED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 5_000_000,
  },
  {
    id: "ag-202",
    campaignId: "5029173846",
    name: "Affinity - Home Decorators",
    status: "ENABLED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 4_500_000,
  },
  {
    id: "ag-203",
    campaignId: "5029173846",
    name: "Custom Intent - Furniture Shoppers",
    status: "ENABLED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 6_000_000,
  },

  // ── Acme Corp: Holiday Shopping 2026 (Shopping) ────────────────────────
  {
    id: "ag-301",
    campaignId: "6715028394",
    name: "All Products",
    status: "ENABLED",
    type: "SHOPPING_PRODUCT_ADS",
    cpcBidMicros: 1_200_000,
    targetRoas: 4.5,
  },
  {
    id: "ag-302",
    campaignId: "6715028394",
    name: "Top Sellers - High Priority",
    status: "ENABLED",
    type: "SHOPPING_PRODUCT_ADS",
    cpcBidMicros: 2_000_000,
    targetRoas: 5.0,
  },

  // ── Acme Corp: Performance Max (PMax) ──────────────────────────────────
  {
    id: "ag-401",
    campaignId: "9451637280",
    name: "Asset Group - All Products",
    status: "ENABLED",
    type: "PERFORMANCE_MAX",
  },
  {
    id: "ag-402",
    campaignId: "9451637280",
    name: "Asset Group - Bestsellers",
    status: "ENABLED",
    type: "PERFORMANCE_MAX",
  },

  // ── Acme Corp: Retargeting - Cart Abandoners (Display) ─────────────────
  {
    id: "ag-501",
    campaignId: "4263819075",
    name: "Cart Abandon 1-3 Days",
    status: "ENABLED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 8_000_000,
    targetCpaMicros: 10_000_000,
  },
  {
    id: "ag-502",
    campaignId: "4263819075",
    name: "Cart Abandon 4-14 Days",
    status: "ENABLED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 6_000_000,
    targetCpaMicros: 12_000_000,
  },
  {
    id: "ag-503",
    campaignId: "4263819075",
    name: "Browse Abandon - Product Viewers",
    status: "ENABLED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 4_000_000,
    targetCpaMicros: 15_000_000,
  },

  // ── Acme Corp: Demand Gen - Spring Collection ──────────────────────────
  {
    id: "ag-601",
    campaignId: "8194057326",
    name: "Spring Lookbook - Gmail",
    status: "PAUSED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 7_000_000,
  },
  {
    id: "ag-602",
    campaignId: "8194057326",
    name: "Spring Lookbook - YouTube",
    status: "PAUSED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 9_000_000,
  },

  // ── Acme Corp: YouTube Pre-Roll (Video) ────────────────────────────────
  {
    id: "ag-701",
    campaignId: "3850172694",
    name: "Skippable In-Stream - Brand Story",
    status: "ENABLED",
    type: "VIDEO_TRUE_VIEW_IN_STREAM",
    cpvBidMicros: 150_000,
  },
  {
    id: "ag-702",
    campaignId: "3850172694",
    name: "Bumper Ads - 6 Second",
    status: "ENABLED",
    type: "VIDEO_BUMPER",
    cpmBidMicros: 12_000_000,
  },

  // ── Acme Corp: Back to School (Shopping) ───────────────────────────────
  {
    id: "ag-801",
    campaignId: "1746389052",
    name: "School Supplies",
    status: "PAUSED",
    type: "SHOPPING_PRODUCT_ADS",
    cpcBidMicros: 1_500_000,
    targetRoas: 3.8,
  },
  {
    id: "ag-802",
    campaignId: "1746389052",
    name: "Backpacks & Bags",
    status: "PAUSED",
    type: "SHOPPING_PRODUCT_ADS",
    cpcBidMicros: 1_800_000,
    targetRoas: 4.0,
  },

  // ── Acme Corp: Discovery (REMOVED) ─────────────────────────────────────
  {
    id: "ag-901",
    campaignId: "4091625738",
    name: "Discovery - Lifestyle",
    status: "REMOVED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 5_500_000,
  },

  // ── Widget Inc: Product Launch - Widget Pro (Search) ───────────────────
  {
    id: "ag-1001",
    campaignId: "1948362057",
    name: "Widget Pro - Exact Match",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 3_500_000,
    targetCpaMicros: 12_000_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-1002",
    campaignId: "1948362057",
    name: "Widget Pro - Phrase Match",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 3_000_000,
    targetCpaMicros: 15_000_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-1003",
    campaignId: "1948362057",
    name: "Widget Pro - Broad Match",
    status: "PAUSED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 2_500_000,
    targetCpaMicros: 18_000_000,
  },

  // ── Widget Inc: Lead Gen - Enterprise (Search) ─────────────────────────
  {
    id: "ag-1101",
    campaignId: "7580194362",
    name: "Project Management Software",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 8_000_000,
    targetCpaMicros: 45_000_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-1102",
    campaignId: "7580194362",
    name: "Enterprise Collaboration Tools",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 10_000_000,
    targetCpaMicros: 50_000_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-1103",
    campaignId: "7580194362",
    name: "Team Productivity Software",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 7_500_000,
    targetCpaMicros: 40_000_000,
  },

  // ── Widget Inc: Video - Product Demo ───────────────────────────────────
  {
    id: "ag-1201",
    campaignId: "3082947561",
    name: "Product Demo - Skippable",
    status: "ENABLED",
    type: "VIDEO_TRUE_VIEW_IN_STREAM",
    cpvBidMicros: 100_000,
  },
  {
    id: "ag-1202",
    campaignId: "3082947561",
    name: "Customer Testimonials",
    status: "ENABLED",
    type: "VIDEO_TRUE_VIEW_IN_STREAM",
    cpvBidMicros: 120_000,
  },

  // ── Widget Inc: Competitor Conquest (Search) ───────────────────────────
  {
    id: "ag-1301",
    campaignId: "6927401835",
    name: "vs Asana",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 12_000_000,
    adRotationMode: "ROTATE_INDEFINITELY",
  },
  {
    id: "ag-1302",
    campaignId: "6927401835",
    name: "vs Monday.com",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 11_000_000,
    adRotationMode: "ROTATE_INDEFINITELY",
  },
  {
    id: "ag-1303",
    campaignId: "6927401835",
    name: "vs Jira",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 10_000_000,
    adRotationMode: "ROTATE_INDEFINITELY",
  },

  // ── Widget Inc: App Install (Multi-Channel) ────────────────────────────
  {
    id: "ag-1401",
    campaignId: "2637405918",
    name: "iOS App Install",
    status: "PAUSED",
    type: "SEARCH_STANDARD",
    targetCpaMicros: 8_000_000,
  },
  {
    id: "ag-1402",
    campaignId: "2637405918",
    name: "Android App Install",
    status: "PAUSED",
    type: "SEARCH_STANDARD",
    targetCpaMicros: 6_000_000,
  },

  // ── Widget Inc: Display Remarketing (Display) ──────────────────────────
  {
    id: "ag-1501",
    campaignId: "5192038746",
    name: "Trial Expired - Win Back",
    status: "ENABLED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 7_000_000,
    targetCpaMicros: 25_000_000,
  },
  {
    id: "ag-1502",
    campaignId: "5192038746",
    name: "Pricing Page Visitors",
    status: "ENABLED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 9_000_000,
    targetCpaMicros: 20_000_000,
  },

  // ── Widget Inc: PMax - SaaS Signups ────────────────────────────────────
  {
    id: "ag-1601",
    campaignId: "7213840569",
    name: "Asset Group - Free Trial",
    status: "ENABLED",
    type: "PERFORMANCE_MAX",
  },
  {
    id: "ag-1602",
    campaignId: "7213840569",
    name: "Asset Group - Enterprise Demo",
    status: "ENABLED",
    type: "PERFORMANCE_MAX",
  },

  // ── Greenleaf Dental: Local Services ───────────────────────────────────
  {
    id: "ag-1701",
    campaignId: "5308261947",
    name: "Emergency Dental NYC",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 15_000_000,
  },
  {
    id: "ag-1702",
    campaignId: "5308261947",
    name: "Emergency Dental Brooklyn",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 12_000_000,
  },

  // ── Greenleaf Dental: New Patient Acquisition (Search) ─────────────────
  {
    id: "ag-1801",
    campaignId: "6103827459",
    name: "Dentist Near Me",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 8_000_000,
    targetCpaMicros: 35_000_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-1802",
    campaignId: "6103827459",
    name: "Family Dentist",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 6_000_000,
    targetCpaMicros: 30_000_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-1803",
    campaignId: "6103827459",
    name: "Dental Insurance Accepted",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 5_000_000,
    targetCpaMicros: 28_000_000,
  },

  // ── Greenleaf Dental: Invisalign Promo (Display) ───────────────────────
  {
    id: "ag-1901",
    campaignId: "8472910365",
    name: "In-Market - Orthodontics",
    status: "ENABLED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 6_000_000,
  },
  {
    id: "ag-1902",
    campaignId: "8472910365",
    name: "Custom Intent - Braces Alternatives",
    status: "ENABLED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 7_000_000,
  },

  // ── Greenleaf Dental: Teeth Whitening (Search) ─────────────────────────
  {
    id: "ag-2001",
    campaignId: "2938471056",
    name: "Teeth Whitening Near Me",
    status: "PAUSED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 5_000_000,
  },
  {
    id: "ag-2002",
    campaignId: "2938471056",
    name: "Professional Whitening",
    status: "PAUSED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 4_500_000,
  },

  // ── Greenleaf Dental: PMax - All Locations ─────────────────────────────
  {
    id: "ag-2101",
    campaignId: "1057293846",
    name: "Asset Group - Manhattan",
    status: "ENABLED",
    type: "PERFORMANCE_MAX",
  },
  {
    id: "ag-2102",
    campaignId: "1057293846",
    name: "Asset Group - Brooklyn",
    status: "ENABLED",
    type: "PERFORMANCE_MAX",
  },

  // ── Nomad Roasters: Brand Search ───────────────────────────────────────
  {
    id: "ag-2201",
    campaignId: "7391624058",
    name: "Nomad Roasters - Exact",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 1_500_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-2202",
    campaignId: "7391624058",
    name: "Nomad Coffee - Phrase",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 1_200_000,
    adRotationMode: "OPTIMIZE",
  },

  // ── Nomad Roasters: Coffee Subscriptions (Search) ──────────────────────
  {
    id: "ag-2301",
    campaignId: "4826103957",
    name: "Coffee Subscription Box",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 4_000_000,
    targetCpaMicros: 18_000_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-2302",
    campaignId: "4826103957",
    name: "Monthly Coffee Delivery",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 3_500_000,
    targetCpaMicros: 20_000_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-2303",
    campaignId: "4826103957",
    name: "Coffee Gift Subscription",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 3_000_000,
    targetCpaMicros: 22_000_000,
  },

  // ── Nomad Roasters: Shopping - Single Origin ───────────────────────────
  {
    id: "ag-2401",
    campaignId: "9174520836",
    name: "Ethiopian Single Origin",
    status: "ENABLED",
    type: "SHOPPING_PRODUCT_ADS",
    cpcBidMicros: 1_000_000,
    targetRoas: 5.0,
  },
  {
    id: "ag-2402",
    campaignId: "9174520836",
    name: "Colombian Single Origin",
    status: "ENABLED",
    type: "SHOPPING_PRODUCT_ADS",
    cpcBidMicros: 900_000,
    targetRoas: 4.8,
  },
  {
    id: "ag-2403",
    campaignId: "9174520836",
    name: "All Other Beans",
    status: "ENABLED",
    type: "SHOPPING_PRODUCT_ADS",
    cpcBidMicros: 800_000,
    targetRoas: 4.0,
  },

  // ── Nomad Roasters: YouTube - Brewing Guides (Video) ───────────────────
  {
    id: "ag-2501",
    campaignId: "6285041739",
    name: "Pour Over Tutorial",
    status: "ENABLED",
    type: "VIDEO_TRUE_VIEW_IN_STREAM",
    cpvBidMicros: 80_000,
  },
  {
    id: "ag-2502",
    campaignId: "6285041739",
    name: "Espresso Basics",
    status: "ENABLED",
    type: "VIDEO_TRUE_VIEW_IN_STREAM",
    cpvBidMicros: 90_000,
  },

  // ── Nomad Roasters: Demand Gen - Gift Sets (PAUSED) ────────────────────
  {
    id: "ag-2601",
    campaignId: "3618729405",
    name: "Holiday Gift Guide - Gmail",
    status: "PAUSED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 8_000_000,
  },
  {
    id: "ag-2602",
    campaignId: "3618729405",
    name: "Holiday Gift Guide - Discover",
    status: "PAUSED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 7_000_000,
  },

  // ── Nomad Roasters: PMax - All Coffee ──────────────────────────────────
  {
    id: "ag-2701",
    campaignId: "8043156279",
    name: "Asset Group - Subscriptions",
    status: "ENABLED",
    type: "PERFORMANCE_MAX",
  },
  {
    id: "ag-2702",
    campaignId: "8043156279",
    name: "Asset Group - Single Bags",
    status: "ENABLED",
    type: "PERFORMANCE_MAX",
  },

  // ── Pinnacle Fitness: Gym Memberships (Search) ─────────────────────────
  {
    id: "ag-2801",
    campaignId: "5827014936",
    name: "Gym Near Me",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 6_000_000,
    targetCpaMicros: 30_000_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-2802",
    campaignId: "5827014936",
    name: "Best Gym Membership",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 7_000_000,
    targetCpaMicros: 35_000_000,
    adRotationMode: "OPTIMIZE",
  },
  {
    id: "ag-2803",
    campaignId: "5827014936",
    name: "24 Hour Gym",
    status: "ENABLED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 5_500_000,
    targetCpaMicros: 28_000_000,
  },

  // ── Pinnacle Fitness: New Year Resolution (Search) ─────────────────────
  {
    id: "ag-2901",
    campaignId: "1694027385",
    name: "New Year Fitness Goals",
    status: "PAUSED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 8_000_000,
    targetCpaMicros: 25_000_000,
  },
  {
    id: "ag-2902",
    campaignId: "1694027385",
    name: "January Gym Deals",
    status: "PAUSED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 7_000_000,
    targetCpaMicros: 22_000_000,
  },

  // ── Pinnacle Fitness: Online Training (Display) ────────────────────────
  {
    id: "ag-3001",
    campaignId: "4039281756",
    name: "In-Market - Fitness Equipment",
    status: "ENABLED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 5_000_000,
    targetCpaMicros: 20_000_000,
  },
  {
    id: "ag-3002",
    campaignId: "4039281756",
    name: "Affinity - Health & Fitness",
    status: "ENABLED",
    type: "DISPLAY_STANDARD",
    cpmBidMicros: 4_000_000,
    targetCpaMicros: 22_000_000,
  },

  // ── Pinnacle Fitness: YouTube (Video) ──────────────────────────────────
  {
    id: "ag-3101",
    campaignId: "7250493618",
    name: "Transformation Stories - 30s",
    status: "ENABLED",
    type: "VIDEO_TRUE_VIEW_IN_STREAM",
    cpvBidMicros: 110_000,
  },
  {
    id: "ag-3102",
    campaignId: "7250493618",
    name: "Trainer Spotlights - 15s",
    status: "ENABLED",
    type: "VIDEO_BUMPER",
    cpmBidMicros: 10_000_000,
  },

  // ── Pinnacle Fitness: PMax - All Locations ─────────────────────────────
  {
    id: "ag-3201",
    campaignId: "9381620547",
    name: "Asset Group - Downtown Locations",
    status: "ENABLED",
    type: "PERFORMANCE_MAX",
  },
  {
    id: "ag-3202",
    campaignId: "9381620547",
    name: "Asset Group - Suburban Locations",
    status: "ENABLED",
    type: "PERFORMANCE_MAX",
  },

  // ── Pinnacle Fitness: Smart Campaign (REMOVED) ─────────────────────────
  {
    id: "ag-3301",
    campaignId: "2760841593",
    name: "Personal Training Leads",
    status: "REMOVED",
    type: "SEARCH_STANDARD",
    cpcBidMicros: 5_000_000,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ADS — every ad group gets 1–3 ads with realistic copy
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_ADS: GadsAd[] = [
  // ── Acme Corp: Summer Sale > Brand Keywords ────────────────────────────
  {
    id: "ad-101a",
    adGroupId: "ag-101",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Acme Summer Sale - 50% Off",
      "Shop Acme Summer Collection",
      "Free Shipping on $50+",
      "Best Summer Deals 2026",
      "Acme Official Store",
    ],
    descriptions: [
      "Get amazing summer deals on all products. Shop our collection today & save up to 50%.",
      "Free shipping on orders over $50. Limited time summer sale — don't miss out!",
    ],
    finalUrls: ["https://acme.com/summer-sale"],
    path1: "summer",
    path2: "sale",
  },
  {
    id: "ad-101b",
    adGroupId: "ag-101",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Acme Summer Clearance",
      "New Arrivals - Summer 2026",
      "Trending Now at Acme",
      "Shop the Look for Less",
    ],
    descriptions: [
      "Discover our latest summer arrivals. Stylish, affordable, delivered fast to your door.",
      "Summer clearance event — up to 60% off select styles. While supplies last.",
    ],
    finalUrls: ["https://acme.com/summer-collection"],
    path1: "summer",
    path2: "new",
  },

  // ── Acme Corp: Summer Sale > Generic - Summer Deals ────────────────────
  {
    id: "ad-102a",
    adGroupId: "ag-102",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Summer Deals Online",
      "Shop Top Products Today",
      "Quality Guaranteed",
      "Fast Delivery Available",
    ],
    descriptions: [
      "Shop top-quality products at competitive prices. Satisfaction guaranteed or your money back.",
      "Browse hundreds of summer deals. New markdowns added daily — shop before they're gone.",
    ],
    finalUrls: ["https://acme.com/deals"],
    path1: "deals",
    path2: "summer",
  },

  // ── Acme Corp: Summer Sale > Competitor Keywords ───────────────────────
  {
    id: "ad-103a",
    adGroupId: "ag-103",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Looking for Better Deals?",
      "Switch to Acme & Save",
      "Compare Before You Buy",
      "Top Rated Alternative",
    ],
    descriptions: [
      "See why thousands switched to Acme. Better quality, better prices, free returns.",
      "Not happy with your current store? Try Acme risk-free with our 90-day guarantee.",
    ],
    finalUrls: ["https://acme.com/why-acme"],
    path1: "compare",
  },

  // ── Acme Corp: Brand Awareness Q3 > In-Market ─────────────────────────
  {
    id: "ad-201a",
    adGroupId: "ag-201",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Transform Your Home with Acme"],
    descriptions: [
      "Quality home goods designed for modern living. Shop the Acme collection today.",
    ],
    finalUrls: ["https://acme.com/home"],
  },
  {
    id: "ad-201b",
    adGroupId: "ag-201",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Acme — Built for Your Home"],
    descriptions: [
      "From kitchen to bedroom, Acme has everything you need. Free shipping on $75+.",
    ],
    finalUrls: ["https://acme.com/collections"],
  },

  // ── Acme Corp: Brand Awareness Q3 > Affinity ──────────────────────────
  {
    id: "ad-202a",
    adGroupId: "ag-202",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Design Your Dream Space"],
    descriptions: [
      "Curated home décor for every style. Explore our new collection at Acme.",
    ],
    finalUrls: ["https://acme.com/decor"],
  },

  // ── Acme Corp: Brand Awareness Q3 > Custom Intent ─────────────────────
  {
    id: "ad-203a",
    adGroupId: "ag-203",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Furniture That Fits Your Life"],
    descriptions: [
      "Modern furniture at honest prices. Free assembly & delivery on orders over $200.",
    ],
    finalUrls: ["https://acme.com/furniture"],
  },

  // ── Acme Corp: Holiday Shopping > All Products ─────────────────────────
  {
    id: "ad-301a",
    adGroupId: "ag-301",
    type: "SHOPPING_AD",
    headlines: ["Holiday Gift Guide - Acme"],
    descriptions: ["Free shipping on all holiday orders. Gift wrap available."],
    finalUrls: ["https://acme.com/holiday"],
  },

  // ── Acme Corp: Holiday Shopping > Top Sellers ──────────────────────────
  {
    id: "ad-302a",
    adGroupId: "ag-302",
    type: "SHOPPING_AD",
    headlines: ["Bestselling Gifts - Acme"],
    descriptions: ["Our most popular items, perfect for gifting. Ships in 24 hours."],
    finalUrls: ["https://acme.com/bestsellers"],
  },

  // ── Acme Corp: PMax > All Products ─────────────────────────────────────
  {
    id: "ad-401a",
    adGroupId: "ag-401",
    type: "PERFORMANCE_MAX_AD",
    headlines: [
      "Acme - Quality Home Goods",
      "Shop Now at Acme.com",
      "Free Shipping Over $50",
      "New Arrivals Weekly",
      "Trusted by 500K+ Customers",
    ],
    descriptions: [
      "Discover the Acme difference. Premium home goods at prices you'll love.",
      "Shop 10,000+ products with free shipping and hassle-free returns.",
    ],
    finalUrls: ["https://acme.com"],
  },

  // ── Acme Corp: PMax > Bestsellers ──────────────────────────────────────
  {
    id: "ad-402a",
    adGroupId: "ag-402",
    type: "PERFORMANCE_MAX_AD",
    headlines: [
      "Acme Top Picks",
      "Most Loved Products",
      "Customer Favorites",
      "Shop Our Bestsellers",
    ],
    descriptions: [
      "See what everyone's buying. Top-rated products hand-picked by our team.",
      "Join 500,000+ happy customers. Shop bestsellers with free returns.",
    ],
    finalUrls: ["https://acme.com/bestsellers"],
  },

  // ── Acme Corp: Retargeting > Cart Abandon 1-3 Days ────────────────────
  {
    id: "ad-501a",
    adGroupId: "ag-501",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["You Left Something Behind"],
    descriptions: [
      "Your cart is waiting! Complete your order and get 10% off with code COMEBACK10.",
    ],
    finalUrls: ["https://acme.com/cart"],
  },

  // ── Acme Corp: Retargeting > Cart Abandon 4-14 Days ───────────────────
  {
    id: "ad-502a",
    adGroupId: "ag-502",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Still Thinking It Over?"],
    descriptions: [
      "Your favorites are selling fast. Come back and enjoy free shipping on us.",
    ],
    finalUrls: ["https://acme.com/cart"],
  },

  // ── Acme Corp: Retargeting > Browse Abandon ───────────────────────────
  {
    id: "ad-503a",
    adGroupId: "ag-503",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Picked Just for You"],
    descriptions: [
      "Based on what you browsed, we think you'll love these. Shop now at Acme.",
    ],
    finalUrls: ["https://acme.com/recommendations"],
  },

  // ── Acme Corp: Demand Gen > Spring Gmail ───────────────────────────────
  {
    id: "ad-601a",
    adGroupId: "ag-601",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Spring Collection is Here"],
    descriptions: [
      "Fresh designs for a fresh season. Explore the new Acme Spring '26 lookbook.",
    ],
    finalUrls: ["https://acme.com/spring"],
  },

  // ── Acme Corp: Demand Gen > Spring YouTube ─────────────────────────────
  {
    id: "ad-602a",
    adGroupId: "ag-602",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["New Season. New Style."],
    descriptions: [
      "The Acme Spring Collection — vibrant colors, timeless design. Shop today.",
    ],
    finalUrls: ["https://acme.com/spring"],
  },

  // ── Acme Corp: YouTube Pre-Roll > Skippable ───────────────────────────
  {
    id: "ad-701a",
    adGroupId: "ag-701",
    type: "VIDEO_AD",
    headlines: ["The Acme Story"],
    descriptions: [
      "From workshop to your home — see how Acme crafts products you'll love for years.",
    ],
    finalUrls: ["https://acme.com/our-story"],
  },

  // ── Acme Corp: YouTube Pre-Roll > Bumper ───────────────────────────────
  {
    id: "ad-702a",
    adGroupId: "ag-702",
    type: "VIDEO_AD",
    headlines: ["Acme. Made Right."],
    descriptions: ["Quality you can feel. Visit acme.com"],
    finalUrls: ["https://acme.com"],
  },

  // ── Acme Corp: Back to School > School Supplies ────────────────────────
  {
    id: "ad-801a",
    adGroupId: "ag-801",
    type: "SHOPPING_AD",
    headlines: ["Back to School Essentials"],
    descriptions: ["Everything for the new school year. Shop supplies at Acme."],
    finalUrls: ["https://acme.com/school-supplies"],
  },

  // ── Acme Corp: Back to School > Backpacks ──────────────────────────────
  {
    id: "ad-802a",
    adGroupId: "ag-802",
    type: "SHOPPING_AD",
    headlines: ["Backpacks for Every Student"],
    descriptions: ["Durable, stylish backpacks built to last. Free shipping on $40+."],
    finalUrls: ["https://acme.com/backpacks"],
  },

  // ── Acme Corp: Discovery (REMOVED) ─────────────────────────────────────
  {
    id: "ad-901a",
    adGroupId: "ag-901",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Discover New Favorites"],
    descriptions: ["Explore products curated just for you on YouTube, Gmail, and Discover."],
    finalUrls: ["https://acme.com/discover"],
  },

  // ── Widget Inc: Product Launch > Exact Match ───────────────────────────
  {
    id: "ad-1001a",
    adGroupId: "ag-1001",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Widget Pro - Now Available",
      "Try Widget Pro Free for 30 Days",
      "The #1 Project Management Tool",
      "Widget Pro - Built for Teams",
    ],
    descriptions: [
      "The all-new Widget Pro. Faster, smarter, better. Start your free trial today.",
      "Trusted by 10,000+ teams worldwide. Widget Pro — project management reimagined.",
    ],
    finalUrls: ["https://widget.inc/pro"],
    path1: "pro",
    path2: "free-trial",
  },
  {
    id: "ad-1001b",
    adGroupId: "ag-1001",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Widget Pro - See What's New",
      "Upgrade to Widget Pro",
      "Pro Features, Simple Pricing",
    ],
    descriptions: [
      "Gantt charts, time tracking, resource management — all in one tool. Try free.",
    ],
    finalUrls: ["https://widget.inc/pro/features"],
    path1: "pro",
    path2: "features",
  },

  // ── Widget Inc: Product Launch > Phrase Match ──────────────────────────
  {
    id: "ad-1002a",
    adGroupId: "ag-1002",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Project Management Made Easy",
      "Widget Pro for Teams",
      "Collaborate in Real Time",
      "14-Day Free Trial",
    ],
    descriptions: [
      "Simplify your workflow with Widget Pro. Kanban, Gantt, and list views — all built in.",
      "No credit card required. Start managing projects better today.",
    ],
    finalUrls: ["https://widget.inc/pro/trial"],
    path1: "pro",
    path2: "trial",
  },

  // ── Widget Inc: Product Launch > Broad Match ───────────────────────────
  {
    id: "ad-1003a",
    adGroupId: "ag-1003",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Better Way to Manage Projects",
      "Work Smarter with Widget",
      "Free Project Management Tool",
    ],
    descriptions: [
      "From task tracking to team collaboration — Widget Pro does it all. Try it free.",
    ],
    finalUrls: ["https://widget.inc/pro"],
    path1: "project",
    path2: "management",
  },

  // ── Widget Inc: Lead Gen > Project Management Software ─────────────────
  {
    id: "ad-1101a",
    adGroupId: "ag-1101",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Enterprise Project Management",
      "Trusted by Fortune 500 Teams",
      "SOC 2 Certified Platform",
      "Request a Demo Today",
      "Scale Your Team's Output",
    ],
    descriptions: [
      "Enterprise-grade project management with SSO, audit logs, and dedicated support.",
      "See why Fortune 500 companies choose Widget. Request your personalized demo.",
    ],
    finalUrls: ["https://widget.inc/enterprise"],
    path1: "enterprise",
    path2: "demo",
  },
  {
    id: "ad-1101b",
    adGroupId: "ag-1101",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Project Management at Scale",
      "Built for Complex Workflows",
      "99.99% Uptime SLA",
      "Widget Enterprise Edition",
    ],
    descriptions: [
      "Manage portfolios, resources, and budgets in one platform. Enterprise SLA included.",
    ],
    finalUrls: ["https://widget.inc/enterprise/features"],
    path1: "enterprise",
    path2: "features",
  },

  // ── Widget Inc: Lead Gen > Enterprise Collaboration ────────────────────
  {
    id: "ad-1102a",
    adGroupId: "ag-1102",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Team Collaboration Platform",
      "Break Down Silos",
      "Docs, Chat & Tasks in One",
      "Book a Live Demo",
    ],
    descriptions: [
      "Unify your team's work in Widget. Real-time collaboration with enterprise security.",
      "Replace 5 tools with 1. Widget combines docs, tasks, chat, and reporting.",
    ],
    finalUrls: ["https://widget.inc/enterprise/collaboration"],
    path1: "enterprise",
    path2: "collab",
  },

  // ── Widget Inc: Lead Gen > Team Productivity ───────────────────────────
  {
    id: "ad-1103a",
    adGroupId: "ag-1103",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Boost Team Productivity",
      "Automate Repetitive Work",
      "Integrates with 200+ Tools",
      "Free for Small Teams",
    ],
    descriptions: [
      "Automate workflows, track progress, and hit deadlines — all in Widget.",
      "Integrates with Slack, Jira, GitHub, Salesforce, and 200+ more. Free tier available.",
    ],
    finalUrls: ["https://widget.inc/productivity"],
    path1: "productivity",
    path2: "tools",
  },

  // ── Widget Inc: Video > Product Demo ───────────────────────────────────
  {
    id: "ad-1201a",
    adGroupId: "ag-1201",
    type: "VIDEO_AD",
    headlines: ["See Widget Pro in Action"],
    descriptions: [
      "Watch how Widget Pro helps teams ship faster. 2-minute product walkthrough.",
    ],
    finalUrls: ["https://widget.inc/demo"],
  },

  // ── Widget Inc: Video > Testimonials ───────────────────────────────────
  {
    id: "ad-1202a",
    adGroupId: "ag-1202",
    type: "VIDEO_AD",
    headlines: ["Why Teams Love Widget"],
    descriptions: [
      "Hear from real customers who transformed their workflow with Widget Pro.",
    ],
    finalUrls: ["https://widget.inc/customers"],
  },

  // ── Widget Inc: Competitor Conquest > vs Asana ─────────────────────────
  {
    id: "ad-1301a",
    adGroupId: "ag-1301",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Looking for an Asana Alternative?",
      "Widget vs Asana - See the Diff",
      "Switch & Save 40%",
      "Free Data Migration",
    ],
    descriptions: [
      "Widget offers everything Asana does — plus time tracking, budgets, and custom fields.",
      "Switching is easy. We'll migrate your data for free. Start your trial today.",
    ],
    finalUrls: ["https://widget.inc/compare/asana"],
    path1: "compare",
    path2: "asana",
  },

  // ── Widget Inc: Competitor Conquest > vs Monday ────────────────────────
  {
    id: "ad-1302a",
    adGroupId: "ag-1302",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Monday.com Alternative",
      "Widget - Simpler & More Powerful",
      "No Hidden Fees",
      "Try Free for 30 Days",
    ],
    descriptions: [
      "Tired of Monday.com's pricing tiers? Widget gives you everything in one plan.",
      "More features, simpler pricing. See why teams are switching to Widget.",
    ],
    finalUrls: ["https://widget.inc/compare/monday"],
    path1: "compare",
    path2: "monday",
  },

  // ── Widget Inc: Competitor Conquest > vs Jira ──────────────────────────
  {
    id: "ad-1303a",
    adGroupId: "ag-1303",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Jira Alternative for Modern Teams",
      "Widget - Built for Speed",
      "No Admin Degree Required",
      "Simple, Powerful, Fast",
    ],
    descriptions: [
      "Widget is the Jira alternative your team actually wants to use. Zero setup headaches.",
      "Move from Jira to Widget in minutes. Import your projects with one click.",
    ],
    finalUrls: ["https://widget.inc/compare/jira"],
    path1: "compare",
    path2: "jira",
  },

  // ── Widget Inc: App Install > iOS ──────────────────────────────────────
  {
    id: "ad-1401a",
    adGroupId: "ag-1401",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Widget Pro for iPhone",
      "Manage Projects on the Go",
      "Download Free on App Store",
    ],
    descriptions: [
      "Take your projects anywhere. Widget Pro for iOS — full functionality in your pocket.",
    ],
    finalUrls: ["https://widget.inc/mobile/ios"],
    path1: "mobile",
    path2: "ios",
  },

  // ── Widget Inc: App Install > Android ──────────────────────────────────
  {
    id: "ad-1402a",
    adGroupId: "ag-1402",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Widget Pro for Android",
      "Project Management Anywhere",
      "Free on Google Play",
    ],
    descriptions: [
      "Stay on top of your projects from any device. Widget Pro for Android is here.",
    ],
    finalUrls: ["https://widget.inc/mobile/android"],
    path1: "mobile",
    path2: "android",
  },

  // ── Widget Inc: Display Remarketing > Trial Expired ────────────────────
  {
    id: "ad-1501a",
    adGroupId: "ag-1501",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Miss Widget Pro?"],
    descriptions: [
      "Your trial ended, but the deal hasn't. Come back and get 3 months at 50% off.",
    ],
    finalUrls: ["https://widget.inc/pro/reactivate"],
  },

  // ── Widget Inc: Display Remarketing > Pricing Visitors ─────────────────
  {
    id: "ad-1502a",
    adGroupId: "ag-1502",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Ready to Upgrade?"],
    descriptions: [
      "You checked our pricing — let's make it official. Start Pro today with 20% off.",
    ],
    finalUrls: ["https://widget.inc/pricing?promo=display20"],
  },

  // ── Widget Inc: PMax > Free Trial ──────────────────────────────────────
  {
    id: "ad-1601a",
    adGroupId: "ag-1601",
    type: "PERFORMANCE_MAX_AD",
    headlines: [
      "Widget Pro - Free Trial",
      "Project Management Made Simple",
      "Start in 60 Seconds",
      "No Credit Card Needed",
    ],
    descriptions: [
      "Join 10,000+ teams using Widget Pro. Start your free trial — no credit card required.",
      "From startup to enterprise, Widget scales with your team. Try it free.",
    ],
    finalUrls: ["https://widget.inc/pro/trial"],
  },

  // ── Widget Inc: PMax > Enterprise Demo ─────────────────────────────────
  {
    id: "ad-1602a",
    adGroupId: "ag-1602",
    type: "PERFORMANCE_MAX_AD",
    headlines: [
      "Widget Enterprise",
      "Book Your Demo",
      "Trusted by 500+ Companies",
      "SOC 2 & GDPR Compliant",
    ],
    descriptions: [
      "Enterprise project management with SSO, advanced permissions, and dedicated CSM.",
      "See how leading companies use Widget to deliver projects on time and on budget.",
    ],
    finalUrls: ["https://widget.inc/enterprise/demo"],
  },

  // ── Greenleaf Dental: Local Services > Emergency NYC ───────────────────
  {
    id: "ad-1701a",
    adGroupId: "ag-1701",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Emergency Dentist NYC",
      "Same-Day Appointments",
      "Open Evenings & Weekends",
      "Walk-Ins Welcome",
    ],
    descriptions: [
      "Dental emergency? Greenleaf Dental sees emergency patients same day. Call now.",
      "Open 7 days a week. Emergency dental care in Midtown Manhattan. Most insurance accepted.",
    ],
    finalUrls: ["https://greenleafdental.com/emergency"],
    path1: "emergency",
    path2: "nyc",
  },

  // ── Greenleaf Dental: Local Services > Emergency Brooklyn ──────────────
  {
    id: "ad-1702a",
    adGroupId: "ag-1702",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Emergency Dentist Brooklyn",
      "No Wait Times",
      "Accepting New Patients",
      "Insurance Friendly",
    ],
    descriptions: [
      "Brooklyn's trusted emergency dental clinic. Same-day care, evening hours available.",
      "Broken tooth? Severe pain? We're here to help. Greenleaf Dental Brooklyn.",
    ],
    finalUrls: ["https://greenleafdental.com/emergency-brooklyn"],
    path1: "emergency",
    path2: "brooklyn",
  },

  // ── Greenleaf Dental: New Patient > Dentist Near Me ────────────────────
  {
    id: "ad-1801a",
    adGroupId: "ag-1801",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Top-Rated Dentist Near You",
      "New Patient Special - $99 Exam",
      "4.9★ on Google Reviews",
      "Book Online in 30 Seconds",
    ],
    descriptions: [
      "New patients get a comprehensive exam, X-rays, and cleaning for just $99.",
      "Greenleaf Dental — 4.9 stars, 2,000+ reviews. Your smile is in good hands.",
    ],
    finalUrls: ["https://greenleafdental.com/new-patients"],
    path1: "new-patient",
    path2: "special",
  },
  {
    id: "ad-1801b",
    adGroupId: "ag-1801",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Find a Dentist Near You",
      "Greenleaf Dental - 5 Locations",
      "Evening Appointments Available",
    ],
    descriptions: [
      "Convenient locations across NYC. Book your first visit online — takes 30 seconds.",
    ],
    finalUrls: ["https://greenleafdental.com/locations"],
    path1: "locations",
  },

  // ── Greenleaf Dental: New Patient > Family Dentist ─────────────────────
  {
    id: "ad-1802a",
    adGroupId: "ag-1802",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Family Dentist in NYC",
      "Kids Love Greenleaf",
      "Gentle & Caring Team",
      "All Ages Welcome",
    ],
    descriptions: [
      "Caring family dentistry for patients of all ages. Kid-friendly office with TV & games.",
      "From first tooth to wisdom teeth — Greenleaf Dental is your family's dental home.",
    ],
    finalUrls: ["https://greenleafdental.com/family-dentistry"],
    path1: "family",
    path2: "dentist",
  },

  // ── Greenleaf Dental: New Patient > Insurance Accepted ─────────────────
  {
    id: "ad-1803a",
    adGroupId: "ag-1803",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "We Accept Your Insurance",
      "In-Network with Major Plans",
      "Affordable Dental Care",
      "No Surprise Bills",
    ],
    descriptions: [
      "In-network with Aetna, Cigna, Delta Dental, MetLife, and more. Verify coverage online.",
      "Quality dental care doesn't have to break the bank. Flexible payment plans available.",
    ],
    finalUrls: ["https://greenleafdental.com/insurance"],
    path1: "insurance",
  },

  // ── Greenleaf Dental: Invisalign > In-Market ──────────────────────────
  {
    id: "ad-1901a",
    adGroupId: "ag-1901",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Invisalign - $500 Off This Month"],
    descriptions: [
      "Straighten your smile discreetly. Greenleaf Dental is a certified Invisalign provider.",
    ],
    finalUrls: ["https://greenleafdental.com/invisalign"],
  },

  // ── Greenleaf Dental: Invisalign > Custom Intent ──────────────────────
  {
    id: "ad-1902a",
    adGroupId: "ag-1902",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Clear Aligners — No Braces Needed"],
    descriptions: [
      "Skip the metal brackets. Invisalign at Greenleaf starts at $149/mo. Free consultation.",
    ],
    finalUrls: ["https://greenleafdental.com/invisalign/consult"],
  },

  // ── Greenleaf Dental: Teeth Whitening > Near Me ────────────────────────
  {
    id: "ad-2001a",
    adGroupId: "ag-2001",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Teeth Whitening - $199 Special",
      "Brighter Smile in 1 Visit",
      "Professional Whitening NYC",
    ],
    descriptions: [
      "Get up to 8 shades whiter in a single visit. Professional teeth whitening at Greenleaf.",
    ],
    finalUrls: ["https://greenleafdental.com/whitening"],
    path1: "whitening",
    path2: "special",
  },

  // ── Greenleaf Dental: Teeth Whitening > Professional ───────────────────
  {
    id: "ad-2002a",
    adGroupId: "ag-2002",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Zoom Whitening - Results Fast",
      "Wedding-Ready Smile",
      "Safe & Effective",
    ],
    descriptions: [
      "Zoom professional whitening in under an hour. Perfect for events and special occasions.",
    ],
    finalUrls: ["https://greenleafdental.com/zoom-whitening"],
    path1: "zoom",
    path2: "whitening",
  },

  // ── Greenleaf Dental: PMax > Manhattan ─────────────────────────────────
  {
    id: "ad-2101a",
    adGroupId: "ag-2101",
    type: "PERFORMANCE_MAX_AD",
    headlines: [
      "Greenleaf Dental Manhattan",
      "Book Your Visit Today",
      "New Patient Special",
      "4.9★ Google Rating",
    ],
    descriptions: [
      "Manhattan's top-rated dental practice. Comprehensive care, modern technology, warm team.",
      "New patients: exam + X-rays + cleaning for $99. Book online in seconds.",
    ],
    finalUrls: ["https://greenleafdental.com/manhattan"],
  },

  // ── Greenleaf Dental: PMax > Brooklyn ──────────────────────────────────
  {
    id: "ad-2102a",
    adGroupId: "ag-2102",
    type: "PERFORMANCE_MAX_AD",
    headlines: [
      "Greenleaf Dental Brooklyn",
      "Now Open - Park Slope",
      "Accept Most Insurance",
      "Evening Hours Available",
    ],
    descriptions: [
      "Brooklyn's newest dental office. State-of-the-art facility in Park Slope.",
      "Accepting new patients! Evening and Saturday appointments available.",
    ],
    finalUrls: ["https://greenleafdental.com/brooklyn"],
  },

  // ── Nomad Roasters: Brand Search > Exact ───────────────────────────────
  {
    id: "ad-2201a",
    adGroupId: "ag-2201",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Nomad Roasters — Official Site",
      "Specialty Coffee, Roasted Fresh",
      "Free Shipping on $40+",
      "Roasted & Shipped Same Day",
    ],
    descriptions: [
      "Small-batch specialty coffee roasted in Brooklyn. Order by noon, ships same day.",
      "From farm to cup — ethically sourced, expertly roasted. Shop Nomad Roasters.",
    ],
    finalUrls: ["https://nomadroasters.com"],
    path1: "coffee",
  },

  // ── Nomad Roasters: Brand Search > Phrase ──────────────────────────────
  {
    id: "ad-2202a",
    adGroupId: "ag-2202",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Nomad Coffee — Fresh Roasted",
      "Craft Coffee Delivered",
      "Explore Our Blends",
    ],
    descriptions: [
      "Award-winning coffee from Nomad Roasters. Try our signature blends or single origins.",
    ],
    finalUrls: ["https://nomadroasters.com/blends"],
    path1: "blends",
  },

  // ── Nomad Roasters: Coffee Subscriptions > Subscription Box ────────────
  {
    id: "ad-2301a",
    adGroupId: "ag-2301",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Coffee Subscription — $14.99/mo",
      "Fresh Coffee Every Month",
      "Skip or Cancel Anytime",
      "First Bag 50% Off",
    ],
    descriptions: [
      "Get freshly roasted specialty coffee delivered to your door every month. First bag half off.",
      "Choose your roast, frequency, and grind. Customize your perfect coffee subscription.",
    ],
    finalUrls: ["https://nomadroasters.com/subscribe"],
    path1: "subscribe",
  },
  {
    id: "ad-2301b",
    adGroupId: "ag-2301",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Best Coffee Subscription 2026",
      "Curated by Expert Roasters",
      "Try New Origins Monthly",
    ],
    descriptions: [
      "Voted #1 coffee subscription by Coffee Magazine. Explore the world's best beans.",
    ],
    finalUrls: ["https://nomadroasters.com/subscribe"],
    path1: "subscribe",
    path2: "best",
  },

  // ── Nomad Roasters: Coffee Subscriptions > Monthly Delivery ────────────
  {
    id: "ad-2302a",
    adGroupId: "ag-2302",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Monthly Coffee Delivery",
      "Never Run Out of Coffee",
      "Free Shipping Always",
      "Pause Anytime",
    ],
    descriptions: [
      "Set it and forget it. Fresh coffee arrives at your door every 2 or 4 weeks.",
      "Choose from 20+ single origins and blends. Free shipping on all subscription orders.",
    ],
    finalUrls: ["https://nomadroasters.com/delivery"],
    path1: "delivery",
    path2: "monthly",
  },

  // ── Nomad Roasters: Coffee Subscriptions > Gift Subscription ───────────
  {
    id: "ad-2303a",
    adGroupId: "ag-2303",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Gift a Coffee Subscription",
      "Perfect Gift for Coffee Lovers",
      "3, 6, or 12 Month Plans",
      "Gift Card Included",
    ],
    descriptions: [
      "Give the gift of great coffee. Nomad Roasters gift subscriptions start at $39.99.",
      "Includes a personalized gift card and tasting notes. Ships in premium gift packaging.",
    ],
    finalUrls: ["https://nomadroasters.com/gifts"],
    path1: "gift",
    path2: "subscription",
  },

  // ── Nomad Roasters: Shopping > Ethiopian ───────────────────────────────
  {
    id: "ad-2401a",
    adGroupId: "ag-2401",
    type: "SHOPPING_AD",
    headlines: ["Ethiopian Yirgacheffe — Light Roast"],
    descriptions: [
      "Bright, floral, citrusy. Our top-selling single origin from Yirgacheffe, Ethiopia.",
    ],
    finalUrls: ["https://nomadroasters.com/ethiopian-yirgacheffe"],
  },

  // ── Nomad Roasters: Shopping > Colombian ───────────────────────────────
  {
    id: "ad-2402a",
    adGroupId: "ag-2402",
    type: "SHOPPING_AD",
    headlines: ["Colombian Huila — Medium Roast"],
    descriptions: [
      "Smooth, chocolatey, nutty. Single origin from the Huila region of Colombia.",
    ],
    finalUrls: ["https://nomadroasters.com/colombian-huila"],
  },

  // ── Nomad Roasters: Shopping > All Other ───────────────────────────────
  {
    id: "ad-2403a",
    adGroupId: "ag-2403",
    type: "SHOPPING_AD",
    headlines: ["Explore All Single Origins"],
    descriptions: [
      "From Kenya to Sumatra — discover our full range of single origin coffee beans.",
    ],
    finalUrls: ["https://nomadroasters.com/single-origin"],
  },

  // ── Nomad Roasters: YouTube > Pour Over ────────────────────────────────
  {
    id: "ad-2501a",
    adGroupId: "ag-2501",
    type: "VIDEO_AD",
    headlines: ["Perfect Pour Over in 4 Minutes"],
    descriptions: [
      "Learn the art of pour over coffee with our head roaster. Simple technique, incredible taste.",
    ],
    finalUrls: ["https://nomadroasters.com/guides/pour-over"],
  },

  // ── Nomad Roasters: YouTube > Espresso ─────────────────────────────────
  {
    id: "ad-2502a",
    adGroupId: "ag-2502",
    type: "VIDEO_AD",
    headlines: ["Espresso at Home — Easy Guide"],
    descriptions: [
      "Pull café-quality espresso shots at home. Tips from our expert barista team.",
    ],
    finalUrls: ["https://nomadroasters.com/guides/espresso"],
  },

  // ── Nomad Roasters: Demand Gen > Holiday Gmail ─────────────────────────
  {
    id: "ad-2601a",
    adGroupId: "ag-2601",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Holiday Coffee Gift Sets"],
    descriptions: [
      "Give the gift of great coffee. Curated gift sets from $29.99 — with free gift wrapping.",
    ],
    finalUrls: ["https://nomadroasters.com/holiday-gifts"],
  },

  // ── Nomad Roasters: Demand Gen > Holiday Discover ──────────────────────
  {
    id: "ad-2602a",
    adGroupId: "ag-2602",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Coffee Lover's Dream Gift"],
    descriptions: [
      "Sampler sets, brewing kits, and subscriptions — perfect holiday gifts for coffee lovers.",
    ],
    finalUrls: ["https://nomadroasters.com/holiday-gifts"],
  },

  // ── Nomad Roasters: PMax > Subscriptions ───────────────────────────────
  {
    id: "ad-2701a",
    adGroupId: "ag-2701",
    type: "PERFORMANCE_MAX_AD",
    headlines: [
      "Nomad Coffee Subscription",
      "Freshly Roasted Monthly",
      "First Bag 50% Off",
      "Free Shipping Always",
    ],
    descriptions: [
      "Specialty coffee delivered to your door. Small-batch, ethically sourced, expertly roasted.",
      "Join 15,000+ subscribers. Cancel anytime. First bag half off with code WELCOME50.",
    ],
    finalUrls: ["https://nomadroasters.com/subscribe"],
  },

  // ── Nomad Roasters: PMax > Single Bags ─────────────────────────────────
  {
    id: "ad-2702a",
    adGroupId: "ag-2702",
    type: "PERFORMANCE_MAX_AD",
    headlines: [
      "Shop Nomad Coffee",
      "Single Origin & Blends",
      "Roasted Fresh Daily",
      "Ships Same Day",
    ],
    descriptions: [
      "From Ethiopian light roasts to bold espresso blends. Browse our full collection.",
      "Small-batch roasted in Brooklyn. Order by noon ET and it ships the same day.",
    ],
    finalUrls: ["https://nomadroasters.com/shop"],
  },

  // ── Pinnacle Fitness: Gym Memberships > Gym Near Me ────────────────────
  {
    id: "ad-2801a",
    adGroupId: "ag-2801",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Best Gym Near You — Join Today",
      "First Month Free",
      "No Long-Term Contracts",
      "Open 24/7",
      "State-of-the-Art Equipment",
    ],
    descriptions: [
      "Join Pinnacle Fitness and get your first month free. 50+ locations, no contracts.",
      "Premium equipment, group classes, sauna & pool — all included. Tour a location today.",
    ],
    finalUrls: ["https://pinnaclefitness.com/join"],
    path1: "join",
    path2: "free-month",
  },
  {
    id: "ad-2801b",
    adGroupId: "ag-2801",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Find a Pinnacle Gym Near You",
      "50+ Locations Nationwide",
      "Join for $29.99/Month",
    ],
    descriptions: [
      "Enter your zip code and find the nearest Pinnacle Fitness. Free 3-day guest pass.",
    ],
    finalUrls: ["https://pinnaclefitness.com/locations"],
    path1: "locations",
  },

  // ── Pinnacle Fitness: Gym Memberships > Best Gym ───────────────────────
  {
    id: "ad-2802a",
    adGroupId: "ag-2802",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Pinnacle Fitness — Top Rated",
      "Voted Best Gym 2026",
      "All-Inclusive Membership",
      "Personal Training Included",
    ],
    descriptions: [
      "Voted best gym chain 3 years running. Classes, pool, sauna, and PT — one membership.",
      "Premium fitness experience at an honest price. No hidden fees, cancel anytime.",
    ],
    finalUrls: ["https://pinnaclefitness.com/membership"],
    path1: "membership",
    path2: "best",
  },

  // ── Pinnacle Fitness: Gym Memberships > 24 Hour ────────────────────────
  {
    id: "ad-2803a",
    adGroupId: "ag-2803",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "24/7 Gym Access",
      "Work Out on Your Schedule",
      "Never Closed",
      "Key Card Entry",
    ],
    descriptions: [
      "Life doesn't stop at 9pm — neither should your workout. Pinnacle Fitness: open 24/7.",
      "Early morning or late night, our doors are always open. Secure key card access.",
    ],
    finalUrls: ["https://pinnaclefitness.com/24-7"],
    path1: "24-7",
    path2: "gym",
  },

  // ── Pinnacle Fitness: New Year > Fitness Goals ─────────────────────────
  {
    id: "ad-2901a",
    adGroupId: "ag-2901",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "New Year, New You",
      "Resolution Starter Package",
      "3 Free PT Sessions",
      "Join in January — Save 50%",
    ],
    descriptions: [
      "Make 2026 your fittest year. Join Pinnacle in January and get 50% off + 3 free PT sessions.",
      "We help you stick to your resolution. Personal training, nutrition coaching, community support.",
    ],
    finalUrls: ["https://pinnaclefitness.com/new-year"],
    path1: "new-year",
    path2: "deal",
  },

  // ── Pinnacle Fitness: New Year > January Deals ─────────────────────────
  {
    id: "ad-2902a",
    adGroupId: "ag-2902",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "January Gym Special",
      "$0 Enrollment Fee",
      "Limited Time Offer",
      "Ends Jan 31st",
    ],
    descriptions: [
      "Join Pinnacle Fitness this January — $0 enrollment, first month free, no commitment.",
      "This deal won't last. Hundreds of new members joining daily. Reserve your spot.",
    ],
    finalUrls: ["https://pinnaclefitness.com/january-special"],
    path1: "january",
    path2: "special",
  },

  // ── Pinnacle Fitness: Online Training > Fitness Equipment ──────────────
  {
    id: "ad-3001a",
    adGroupId: "ag-3001",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["Train at Home with Pinnacle"],
    descriptions: [
      "Live & on-demand classes from Pinnacle trainers. Start your 7-day free trial.",
    ],
    finalUrls: ["https://pinnaclefitness.com/online"],
  },

  // ── Pinnacle Fitness: Online Training > Health & Fitness ───────────────
  {
    id: "ad-3002a",
    adGroupId: "ag-3002",
    type: "RESPONSIVE_DISPLAY_AD",
    headlines: ["500+ On-Demand Workouts"],
    descriptions: [
      "Yoga, HIIT, strength, cycling — stream from anywhere. New classes added weekly.",
    ],
    finalUrls: ["https://pinnaclefitness.com/online/classes"],
  },

  // ── Pinnacle Fitness: YouTube > Transformation Stories ─────────────────
  {
    id: "ad-3101a",
    adGroupId: "ag-3101",
    type: "VIDEO_AD",
    headlines: ["Real Members. Real Results."],
    descriptions: [
      "See how Pinnacle members transformed their lives. Their stories will inspire you.",
    ],
    finalUrls: ["https://pinnaclefitness.com/transformations"],
  },

  // ── Pinnacle Fitness: YouTube > Trainer Spotlights ─────────────────────
  {
    id: "ad-3102a",
    adGroupId: "ag-3102",
    type: "VIDEO_AD",
    headlines: ["Meet Your Pinnacle Trainer"],
    descriptions: ["World-class trainers dedicated to your goals. Find yours at Pinnacle."],
    finalUrls: ["https://pinnaclefitness.com/trainers"],
  },

  // ── Pinnacle Fitness: PMax > Downtown ──────────────────────────────────
  {
    id: "ad-3201a",
    adGroupId: "ag-3201",
    type: "PERFORMANCE_MAX_AD",
    headlines: [
      "Pinnacle Fitness Downtown",
      "Join Today — First Month Free",
      "Premium Gym Experience",
      "Classes, Pool & Sauna",
    ],
    descriptions: [
      "Downtown's premier fitness destination. All-inclusive membership starting at $29.99/mo.",
      "Group classes, Olympic pool, steam room, and 24/7 access. Tour today.",
    ],
    finalUrls: ["https://pinnaclefitness.com/downtown"],
  },

  // ── Pinnacle Fitness: PMax > Suburban ──────────────────────────────────
  {
    id: "ad-3202a",
    adGroupId: "ag-3202",
    type: "PERFORMANCE_MAX_AD",
    headlines: [
      "Pinnacle Fitness — Your Neighborhood",
      "Family-Friendly Gym",
      "Kids Club Included",
      "Free Parking",
    ],
    descriptions: [
      "A gym the whole family will love. Kids club, family classes, ample free parking.",
      "Suburban convenience, downtown quality. Join Pinnacle in your neighborhood.",
    ],
    finalUrls: ["https://pinnaclefitness.com/suburban"],
  },

  // ── Pinnacle Fitness: Smart Campaign (REMOVED) ─────────────────────────
  {
    id: "ad-3301a",
    adGroupId: "ag-3301",
    type: "RESPONSIVE_SEARCH_AD",
    headlines: [
      "Personal Training Near You",
      "Certified Trainers",
      "First Session Free",
    ],
    descriptions: [
      "One-on-one personal training at Pinnacle. Certified trainers, personalized plans.",
    ],
    finalUrls: ["https://pinnaclefitness.com/personal-training"],
    path1: "personal",
    path2: "training",
  },
];
