import type { GadsAccount } from "@/lib/types";
import type { GmcAccount, ProductCampaignLink } from "@/lib/types/gmc";

interface OaiConnection {
  token: string;
  name: string;
  maskedId: string;
}

interface OaiMcConnection {
  token: string;
  name: string;
  maskedId: string;
}

export interface ActivityEntry {
  campaignName: string;
  campaignId?: string;
  action: "cloned" | "connected" | "disconnected" | "product_copied" | "product_copied_with_campaign";
  timestamp: string;
}

interface UserTokens {
  gadsAccounts: GadsAccount[];
  oai?: OaiConnection;
  gmcAccounts: GmcAccount[];
  oaiMerchantCenter?: OaiMcConnection;
  productCampaignLinks: ProductCampaignLink[];
  activity: ActivityEntry[];
}

const store = new Map<string, UserTokens>();

function getOrCreate(userId: string): UserTokens {
  if (!store.has(userId)) {
    store.set(userId, { gadsAccounts: [], gmcAccounts: [], productCampaignLinks: [], activity: [] });
  }
  return store.get(userId)!;
}

// --- GAds ---

export function addGadsAccount(userId: string, account: GadsAccount): void {
  const tokens = getOrCreate(userId);
  const existing = tokens.gadsAccounts.findIndex(
    (a) => a.customerId === account.customerId,
  );
  if (existing >= 0) {
    tokens.gadsAccounts[existing] = account;
  } else {
    tokens.gadsAccounts.push(account);
  }
}

export function getGadsAccounts(userId: string): GadsAccount[] {
  return store.get(userId)?.gadsAccounts ?? [];
}

export function removeGadsAccount(
  userId: string,
  customerId: string,
): void {
  const tokens = store.get(userId);
  if (!tokens) return;
  tokens.gadsAccounts = tokens.gadsAccounts.filter(
    (a) => a.customerId !== customerId,
  );
}

// --- GMC ---

export function addGmcAccount(userId: string, account: GmcAccount): void {
  const tokens = getOrCreate(userId);
  const existing = tokens.gmcAccounts.findIndex(
    (a) => a.merchantId === account.merchantId,
  );
  if (existing >= 0) {
    tokens.gmcAccounts[existing] = account;
  } else {
    tokens.gmcAccounts.push(account);
  }
}

export function getGmcAccounts(userId: string): GmcAccount[] {
  return store.get(userId)?.gmcAccounts ?? [];
}

export function removeGmcAccount(userId: string, merchantId: string): void {
  const tokens = store.get(userId);
  if (!tokens) return;
  tokens.gmcAccounts = tokens.gmcAccounts.filter(
    (a) => a.merchantId !== merchantId,
  );
}

// --- OAI ---

function maskToken(token: string): string {
  if (token.length <= 8) return "****";
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

export function setOaiToken(
  userId: string,
  token: string,
  name?: string,
): void {
  const tokens = getOrCreate(userId);
  tokens.oai = {
    token,
    name: name || "OpenAI Ads",
    maskedId: maskToken(token),
  };
}

export function getOaiToken(userId: string): string | undefined {
  return store.get(userId)?.oai?.token;
}

export function getOaiConnection(
  userId: string,
): OaiConnection | undefined {
  return store.get(userId)?.oai;
}

export function removeOaiConnection(userId: string): void {
  const tokens = store.get(userId);
  if (!tokens) return;
  tokens.oai = undefined;
}

// --- OAI Merchant Center ---

export function setOaiMcToken(userId: string, token: string, name?: string): void {
  const tokens = getOrCreate(userId);
  tokens.oaiMerchantCenter = {
    token,
    name: name || "OpenAI Merchant Center",
    maskedId: maskToken(token),
  };
}

export function getOaiMcToken(userId: string): string | undefined {
  return store.get(userId)?.oaiMerchantCenter?.token;
}

export function getOaiMcConnection(userId: string): OaiMcConnection | undefined {
  return store.get(userId)?.oaiMerchantCenter;
}

export function removeOaiMcConnection(userId: string): void {
  const tokens = store.get(userId);
  if (!tokens) return;
  tokens.oaiMerchantCenter = undefined;
}

export function clearUserTokens(userId: string): void {
  store.delete(userId);
}

// --- Product-Campaign Links ---

export function getProductCampaignLinks(userId: string): ProductCampaignLink[] {
  return store.get(userId)?.productCampaignLinks ?? [];
}

export function getCampaignIdsForProduct(userId: string, productId: string): string[] {
  const links = getProductCampaignLinks(userId);
  return links.find((l) => l.productId === productId)?.campaignIds ?? [];
}

export function getProductIdsForCampaign(userId: string, campaignId: string): string[] {
  const links = getProductCampaignLinks(userId);
  return links
    .filter((l) => l.campaignIds.includes(campaignId))
    .map((l) => l.productId);
}

// --- Activity ---

export function addActivity(userId: string, entry: Omit<ActivityEntry, "timestamp">): void {
  const tokens = getOrCreate(userId);
  tokens.activity.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  if (tokens.activity.length > 20) {
    tokens.activity = tokens.activity.slice(0, 20);
  }
}

export function getActivity(userId: string): ActivityEntry[] {
  return store.get(userId)?.activity ?? [];
}

// --- Mock seed for demo mode ---

if (process.env.USE_MOCK_DATA === "true" || process.env.SKIP_AUTH === "true") {
  const DEV_USER = "dev-user";
  const tokens = getOrCreate(DEV_USER);

  // Seed Google Ads accounts
  if (tokens.gadsAccounts.length === 0) {
    tokens.gadsAccounts = [
      { customerId: "123-456-7890", name: "Acme Corp", accessToken: "", refreshToken: "" },
      { customerId: "987-654-3210", name: "Widget Inc", accessToken: "", refreshToken: "" },
    ];
  }

  // Seed OAI connection
  if (!tokens.oai) {
    tokens.oai = {
      token: "sk-mock-demo-token-abc123xyz",
      name: "OpenAI Ads",
      maskedId: "sk-m...xyz",
    };
  }

  // Seed GMC accounts
  if (tokens.gmcAccounts.length === 0) {
    tokens.gmcAccounts = [
      { merchantId: "MC-100200300", name: "Acme Corp Merchant", accessToken: "", refreshToken: "" },
      { merchantId: "MC-400500600", name: "Widget Inc Merchant", accessToken: "", refreshToken: "" },
    ];
  }

  // Seed OAI Merchant Center connection
  if (!tokens.oaiMerchantCenter) {
    tokens.oaiMerchantCenter = {
      token: "sk-mc-mock-demo-token-xyz789",
      name: "OpenAI Merchant Center",
      maskedId: "sk-m...789",
    };
  }

  // Seed product-campaign links
  if (tokens.productCampaignLinks.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MOCK_PRODUCT_CAMPAIGN_LINKS } = require("@/lib/gmc/mock-data");
    tokens.productCampaignLinks = MOCK_PRODUCT_CAMPAIGN_LINKS;
  }

  // Seed some activity history
  if (tokens.activity.length === 0) {
    const now = Date.now();
    tokens.activity = [
      { campaignName: "Holiday Promo - Search", campaignId: "5029173846", action: "cloned", timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString() },
      { campaignName: "Brand Awareness Q3", campaignId: "1948362057", action: "cloned", timestamp: new Date(now - 5 * 60 * 60 * 1000).toISOString() },
      { campaignName: "Widget Inc", action: "connected", timestamp: new Date(now - 24 * 60 * 60 * 1000).toISOString() },
      { campaignName: "Acme Corp", action: "connected", timestamp: new Date(now - 48 * 60 * 60 * 1000).toISOString() },
    ];
  }
}
