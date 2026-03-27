export interface GadsCampaign {
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
  advertisingChannelType: string;
  advertisingChannelSubType?: string;
  biddingStrategyType: string;
  budget: {
    amountMicros: number;
    totalAmountMicros?: number;
    deliveryMethod: string;
    period: string;
  };
  networkSettings: {
    targetGoogleSearch: boolean;
    targetSearchNetwork: boolean;
    targetContentNetwork: boolean;
    targetPartnerSearchNetwork: boolean;
  };
  geoTargetTypeSetting: {
    positiveGeoTargetType: string;
    negativeGeoTargetType: string;
  };
  startDate?: string;
  endDate?: string;
  trackingUrlTemplate?: string;
  finalUrlSuffix?: string;
  adServingOptimizationStatus?: string;
  urlExpansionOptOut?: boolean;
  accountId: string;
  accountName: string;
}

export interface GadsAdGroup {
  id: string;
  campaignId: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
  type: string;
  cpcBidMicros?: number;
  cpmBidMicros?: number;
  cpvBidMicros?: number;
  targetCpaMicros?: number;
  targetRoas?: number;
  adRotationMode?: string;
}

export interface GadsAd {
  id: string;
  adGroupId: string;
  type: string;
  headlines: string[];
  descriptions: string[];
  finalUrls: string[];
  finalMobileUrls?: string[];
  path1?: string;
  path2?: string;
  trackingUrlTemplate?: string;
}

export interface GadsAccount {
  customerId: string;
  name: string;
  accessToken: string;
  refreshToken: string;
}
