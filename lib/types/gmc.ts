// lib/types/gmc.ts

export type GmcAvailability =
  | "AVAILABILITY_UNSPECIFIED"
  | "IN_STOCK"
  | "OUT_OF_STOCK"
  | "PREORDER"
  | "LIMITED_AVAILABILITY"
  | "BACKORDER";

export type GmcIssueSeverity =
  | "SEVERITY_UNSPECIFIED"
  | "NOT_IMPACTED"
  | "DEMOTED"
  | "DISAPPROVED";

export type ReportingContextEnum =
  | "REPORTING_CONTEXT_ENUM_UNSPECIFIED"
  | "SHOPPING_ADS"
  | "DEMAND_GEN_ADS"
  | "DEMAND_GEN_ADS_DISCOVER_SURFACE"
  | "VIDEO_ADS"
  | "DISPLAY_ADS"
  | "LOCAL_INVENTORY_ADS"
  | "VEHICLE_INVENTORY_ADS"
  | "FREE_LISTINGS"
  | "FREE_LISTINGS_UCP_CHECKOUT"
  | "FREE_LOCAL_LISTINGS"
  | "FREE_LOCAL_VEHICLE_LISTINGS"
  | "YOUTUBE_AFFILIATE"
  | "YOUTUBE_SHOPPING"
  | "CLOUD_RETAIL"
  | "LOCAL_CLOUD_RETAIL"
  | "PRODUCT_REVIEWS"
  | "MERCHANT_REVIEWS"
  | "YOUTUBE_CHECKOUT";

export interface GmcPrice {
  amountMicros: string;
  currencyCode: string;
}

export interface GmcProductDimension {
  value: number;
  unit: "in" | "cm";
}

export interface GmcCustomAttribute {
  name: string;
  value: string;
  groupValues: Record<string, string>[];
}

export interface GmcDestinationStatus {
  reportingContext: ReportingContextEnum;
  approvedCountries: string[];
  pendingCountries: string[];
  disapprovedCountries: string[];
}

export interface GmcItemLevelIssue {
  code: string;
  severity: GmcIssueSeverity;
  resolution: string;
  attribute: string;
  reportingContext: ReportingContextEnum;
  description: string;
  detail: string;
  documentation: string;
  applicableCountries: string[];
}

export interface GmcProductStatus {
  destinationStatuses: GmcDestinationStatus[];
  itemLevelIssues: GmcItemLevelIssue[];
  creationDate: string;
  lastUpdateDate: string;
  googleExpirationDate: string;
}

export interface GmcAutomatedDiscounts {
  priorPrice?: GmcPrice;
  priorPriceProgressive?: GmcPrice;
  gadPrice?: GmcPrice;
}

export interface GmcProductAttributes {
  title: string;
  description: string;
  link: string;
  mobileLink?: string;
  imageLink: string;
  additionalImageLinks: string[];
  availability: GmcAvailability;
  brand: string;
  color?: string;
  price: GmcPrice;
  salePrice?: GmcPrice;
  salePriceEffectiveDate?: { startDate: string; endDate: string };
  productTypes: string[];
  productHeight?: GmcProductDimension;
  productLength?: GmcProductDimension;
  productWidth?: GmcProductDimension;
  productWeight?: GmcProductDimension;
  expirationDate?: string;
  disclosureDate?: string;
  availabilityDate?: string;
  gtins: string[];
  loyaltyPrograms?: Record<string, unknown>[];
  installment?: Record<string, unknown>;
  subscriptionCost?: Record<string, unknown>;
}

export interface GmcProduct {
  name: string;
  offerId: string;
  contentLanguage: string;
  feedLabel: string;
  dataSource: string;
  legacyLocal: boolean;
  productAttributes: GmcProductAttributes;
  customAttributes: GmcCustomAttribute[];
  productStatus: GmcProductStatus;
  automatedDiscounts: GmcAutomatedDiscounts;
  versionNumber: string;
  accountId: string;
  accountName: string;
}

export interface GmcAccount {
  merchantId: string;
  name: string;
  accessToken: string;
  refreshToken: string;
}

export interface OaiMcProductDraft {
  title: string;
  description: string;
  link: string;
  imageLink: string;
  availability: string;
  brand: string;
  price: { amountMicros: string; currencyCode: string };
  productTypes: string[];
  offerId: string;
}

export interface OaiMcCopyResponse {
  draft_id: string;
  product_title: string;
  status: "DRAFT";
  created_at: string;
  warnings: string[];
}

export interface ProductCampaignLink {
  productId: string;
  campaignIds: string[];
}
