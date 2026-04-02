# Google Merchant Center Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google Merchant Center integration with Products section, GMC OAuth, product-campaign cross-links, product copy-to-OAI, and OpenAI Merchant Center settings.

**Architecture:** Mirror the existing `gads` integration pattern. New `lib/gmc/` module parallel to `lib/gads/`, new `lib/oai-mc/` module parallel to `lib/oai/`, new API routes under `/api/gmc/` and `/api/oai-mc/`, new pages under `/dashboard/products/`. Extend `lib/tokens.ts` for GMC and OAI MC storage.

**Tech Stack:** Next.js 16 (App Router), React 19, shadcn/ui, Tailwind CSS 4, Lucide icons, Sonner toasts, Content API for Shopping v2.1

**Spec:** `docs/superpowers/specs/2026-04-02-google-merchant-center-design.md`

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `lib/types/gmc.ts` | All 9 GMC entity types + GmcAccount + OaiMcConnection |
| `lib/gmc/mock-data.ts` | ~15 mock products across 4 accounts with campaign links |
| `lib/gmc/products.ts` | Fetch products (mock or real), product-campaign link queries |
| `lib/gmc/client.ts` | Content API for Shopping client setup |
| `lib/oai-mc/mapper.ts` | Map GMC product → OAI MC product draft |
| `lib/oai-mc/stub.ts` | Simulated OAI MC draft creation (like `lib/oai/stub.ts`) |
| `app/api/gmc/connect/route.ts` | GMC OAuth redirect |
| `app/api/gmc/callback/route.ts` | GMC OAuth token exchange |
| `app/api/gmc/accounts/route.ts` | List GMC accounts |
| `app/api/gmc/accounts/[id]/route.ts` | Delete/disconnect GMC account |
| `app/api/gmc/products/route.ts` | List all products |
| `app/api/gmc/products/[id]/route.ts` | Single product detail |
| `app/api/gmc/products/[id]/campaigns/route.ts` | Campaigns linked to a product |
| `app/api/gads/campaigns/[id]/products/route.ts` | Products linked to a campaign |
| `app/api/oai-mc/token/route.ts` | OAI MC token CRUD |
| `app/api/oai-mc/copy/route.ts` | Copy product(s) to OAI MC |
| `app/dashboard/products/page.tsx` | Products list page |
| `app/dashboard/products/[id]/page.tsx` | Product detail page |
| `app/dashboard/products/copy/[productId]/page.tsx` | Product copy split-pane page |
| `components/product-table.tsx` | Product table with search/filter/sort |
| `components/product-detail.tsx` | Product detail display |
| `components/product-copy-split-pane.tsx` | Split-pane GMC→OAI MC copy editor |
| `components/product-filter-bar.tsx` | Product filters (availability, brand, status) |
| `components/product-toggle-list.tsx` | Product checklist for campaign clone flow |

### Modified Files

| File | Change |
|------|--------|
| `lib/types/index.ts` | Add `export * from "./gmc"` |
| `lib/tokens.ts` | Add `gmcAccounts`, `oaiMerchantCenter`, `productCampaignLinks`, activity types, CRUD functions, mock seed |
| `components/app-sidebar.tsx` | Add Products nav item |
| `app/dashboard/page.tsx` | Add Total Products stat card, product activity entries |
| `app/dashboard/settings/page.tsx` | Add GMC + OAI MC settings sections |
| `app/dashboard/clone/[campaignId]/page.tsx` | Add product toggle list to clone flow |
| `components/campaign-detail.tsx` | Add linked products section |
| `.env.local` | Add `GOOGLE_MC_CLIENT_ID`, `GOOGLE_MC_CLIENT_SECRET` |

---

## Task 1: GMC Type Definitions

**Files:**
- Create: `lib/types/gmc.ts`
- Modify: `lib/types/index.ts`

- [ ] **Step 1: Create `lib/types/gmc.ts` with all 9 entities**

```typescript
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
  // Liftometer additions
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
```

- [ ] **Step 2: Export from `lib/types/index.ts`**

Add to `lib/types/index.ts`:
```typescript
export * from "./gmc";
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to gmc types.

- [ ] **Step 4: Commit**

```bash
git add lib/types/gmc.ts lib/types/index.ts
git commit -m "feat: add GMC type definitions for all 9 Merchant API entities"
```

---

## Task 2: Extend Token Storage

**Files:**
- Modify: `lib/tokens.ts`

- [ ] **Step 1: Add GMC and OAI MC interfaces and storage fields**

In `lib/tokens.ts`, add the import at the top:
```typescript
import type { GmcAccount, ProductCampaignLink } from "@/lib/types/gmc";
```

Add `OaiMcConnection` interface after the existing `OaiConnection`:
```typescript
interface OaiMcConnection {
  token: string;
  name: string;
  maskedId: string;
}
```

Extend `UserTokens` interface to add three new fields:
```typescript
interface UserTokens {
  gadsAccounts: GadsAccount[];
  oai?: OaiConnection;
  gmcAccounts: GmcAccount[];
  oaiMerchantCenter?: OaiMcConnection;
  productCampaignLinks: ProductCampaignLink[];
  activity: ActivityEntry[];
}
```

Update `ActivityEntry.action` type:
```typescript
export interface ActivityEntry {
  campaignName: string;
  campaignId?: string;
  action: "cloned" | "connected" | "disconnected" | "product_copied" | "product_copied_with_campaign";
  timestamp: string;
}
```

Update `getOrCreate` to initialize new fields:
```typescript
function getOrCreate(userId: string): UserTokens {
  if (!store.has(userId)) {
    store.set(userId, { gadsAccounts: [], gmcAccounts: [], productCampaignLinks: [], activity: [] });
  }
  return store.get(userId)!;
}
```

- [ ] **Step 2: Add GMC account CRUD functions**

Add after the `// --- GAds ---` section:
```typescript
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
```

- [ ] **Step 3: Add OAI MC token CRUD functions**

Add after the `// --- OAI ---` section:
```typescript
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
```

- [ ] **Step 4: Add product-campaign link helpers**

Add after OAI MC section:
```typescript
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
```

- [ ] **Step 5: Add GMC and OAI MC mock seed data**

In the mock seed block at the bottom (inside the `if (process.env.USE_MOCK_DATA...)` block), add after the existing activity seed:

```typescript
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
```

- [ ] **Step 6: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add lib/tokens.ts
git commit -m "feat: extend token storage with GMC accounts, OAI MC, and product-campaign links"
```

---

## Task 3: Mock Product Data

**Files:**
- Create: `lib/gmc/mock-data.ts`

- [ ] **Step 1: Create mock product data**

```typescript
// lib/gmc/mock-data.ts

import type { GmcProduct, ProductCampaignLink } from "@/lib/types/gmc";

// ─────────────────────────────────────────────────────────────────────────────
// Products distributed across accounts:
//   Acme Corp Merchant (MC-100200300)  — shoes & apparel (5 products)
//   Widget Inc Merchant (MC-400500600) — electronics & gadgets (4 products)
//   Nomad Roasters has no merchant account (products pulled from Acme feed)
//   Greenleaf Dental — services business, no product feed
//   Pinnacle Fitness — gym equipment (3 products)
// ─────────────────────────────────────────────────────────────────────────────

function makeProduct(
  overrides: Partial<GmcProduct> & {
    offerId: string;
    title: string;
    price: string;
    currency?: string;
    brand: string;
    accountId: string;
    accountName: string;
  },
): GmcProduct {
  const currency = overrides.currency ?? "USD";
  return {
    name: `accounts/${overrides.accountId}/products/${overrides.offerId}`,
    offerId: overrides.offerId,
    contentLanguage: "en",
    feedLabel: "US-EN",
    dataSource: "api",
    legacyLocal: false,
    productAttributes: {
      title: overrides.title,
      description: overrides.title + " — premium quality product.",
      link: `https://store.example.com/products/${overrides.offerId}`,
      imageLink: `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(overrides.title.split(" ").slice(0, 2).join("+"))}`,
      additionalImageLinks: [],
      availability: "IN_STOCK",
      brand: overrides.brand,
      price: { amountMicros: overrides.price, currencyCode: currency },
      productTypes: [],
      gtins: [],
      ...overrides.productAttributes,
    } as GmcProduct["productAttributes"],
    customAttributes: [],
    productStatus: {
      destinationStatuses: [
        { reportingContext: "SHOPPING_ADS", approvedCountries: ["US"], pendingCountries: [], disapprovedCountries: [] },
      ],
      itemLevelIssues: [],
      creationDate: "2026-01-15T10:00:00Z",
      lastUpdateDate: "2026-03-28T14:30:00Z",
      googleExpirationDate: "2026-07-15T10:00:00Z",
    },
    automatedDiscounts: {},
    versionNumber: "1",
    accountId: overrides.accountId,
    accountName: overrides.accountName,
  };
}

export const MOCK_PRODUCTS: GmcProduct[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ACME CORP MERCHANT
  // ═══════════════════════════════════════════════════════════════════════════
  makeProduct({
    offerId: "ACME-RUN-001",
    title: "Running Shoes Pro",
    price: "129990000",
    brand: "Nike",
    accountId: "MC-100200300",
    accountName: "Acme Corp Merchant",
    productAttributes: {
      availability: "IN_STOCK" as const,
      productTypes: ["Apparel & Accessories > Shoes > Athletic Shoes"],
      color: "Black/White",
    },
  }),
  makeProduct({
    offerId: "ACME-TRL-002",
    title: "Trail Runners X",
    price: "89990000",
    brand: "Salomon",
    accountId: "MC-100200300",
    accountName: "Acme Corp Merchant",
    productAttributes: {
      availability: "IN_STOCK" as const,
      productTypes: ["Apparel & Accessories > Shoes > Athletic Shoes"],
      color: "Forest Green",
    },
  }),
  makeProduct({
    offerId: "ACME-BAG-003",
    title: "Gym Bag Deluxe",
    price: "49990000",
    brand: "Under Armour",
    accountId: "MC-100200300",
    accountName: "Acme Corp Merchant",
    productAttributes: {
      availability: "LIMITED_AVAILABILITY" as const,
      productTypes: ["Apparel & Accessories > Handbags, Wallets & Cases"],
    },
  }),
  makeProduct({
    offerId: "ACME-JKT-004",
    title: "Winter Puffer Jacket",
    price: "199990000",
    brand: "North Face",
    accountId: "MC-100200300",
    accountName: "Acme Corp Merchant",
    productAttributes: {
      availability: "IN_STOCK" as const,
      productTypes: ["Apparel & Accessories > Clothing > Outerwear"],
      color: "Navy",
    },
  }),
  makeProduct({
    offerId: "ACME-SHR-005",
    title: "Performance Shorts",
    price: "34990000",
    brand: "Nike",
    accountId: "MC-100200300",
    accountName: "Acme Corp Merchant",
    productAttributes: {
      availability: "IN_STOCK" as const,
      productTypes: ["Apparel & Accessories > Clothing > Shorts"],
      color: "Charcoal",
    },
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // WIDGET INC MERCHANT
  // ═══════════════════════════════════════════════════════════════════════════
  makeProduct({
    offerId: "WIDG-KB-001",
    title: "Mechanical Keyboard MX",
    price: "149990000",
    brand: "Logitech",
    accountId: "MC-400500600",
    accountName: "Widget Inc Merchant",
    productAttributes: {
      availability: "IN_STOCK" as const,
      productTypes: ["Electronics > Computers > Input Devices > Keyboards"],
    },
  }),
  makeProduct({
    offerId: "WIDG-MS-002",
    title: "Ergonomic Mouse Pro",
    price: "79990000",
    brand: "Logitech",
    accountId: "MC-400500600",
    accountName: "Widget Inc Merchant",
    productAttributes: {
      availability: "IN_STOCK" as const,
      productTypes: ["Electronics > Computers > Input Devices > Mice"],
    },
  }),
  makeProduct({
    offerId: "WIDG-MON-003",
    title: '4K Monitor 27"',
    price: "449990000",
    brand: "Dell",
    accountId: "MC-400500600",
    accountName: "Widget Inc Merchant",
    productAttributes: {
      availability: "OUT_OF_STOCK" as const,
      productTypes: ["Electronics > Computers > Computer Monitors"],
    },
  }),
  makeProduct({
    offerId: "WIDG-WC-004",
    title: "HD Webcam Stream",
    price: "59990000",
    brand: "Logitech",
    accountId: "MC-400500600",
    accountName: "Widget Inc Merchant",
    productAttributes: {
      availability: "IN_STOCK" as const,
      productTypes: ["Electronics > Computers > Webcams"],
    },
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // PINNACLE FITNESS (uses Acme's merchant account via linked feed)
  // ═══════════════════════════════════════════════════════════════════════════
  makeProduct({
    offerId: "PINN-DB-001",
    title: "Adjustable Dumbbell Set",
    price: "299990000",
    brand: "Bowflex",
    accountId: "MC-100200300",
    accountName: "Acme Corp Merchant",
    productAttributes: {
      availability: "IN_STOCK" as const,
      productTypes: ["Sporting Goods > Exercise & Fitness > Weights"],
      productWeight: { value: 52.5, unit: "lb" as unknown as "in" },
    },
  }),
  makeProduct({
    offerId: "PINN-YM-002",
    title: "Premium Yoga Mat",
    price: "39990000",
    brand: "Manduka",
    accountId: "MC-100200300",
    accountName: "Acme Corp Merchant",
    productAttributes: {
      availability: "IN_STOCK" as const,
      productTypes: ["Sporting Goods > Exercise & Fitness > Yoga"],
      productLength: { value: 71, unit: "in" },
      productWidth: { value: 26, unit: "in" },
    },
  }),
  makeProduct({
    offerId: "PINN-PRO-003",
    title: "Whey Protein Isolate 5lb",
    price: "54990000",
    brand: "Optimum Nutrition",
    accountId: "MC-100200300",
    accountName: "Acme Corp Merchant",
    productAttributes: {
      availability: "PREORDER" as const,
      productTypes: ["Health & Beauty > Health Care > Fitness & Nutrition"],
    },
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // NOMAD ROASTERS (uses Widget Inc's merchant account)
  // ═══════════════════════════════════════════════════════════════════════════
  makeProduct({
    offerId: "NMAD-CB-001",
    title: "Single Origin Ethiopia Beans",
    price: "18990000",
    brand: "Nomad Roasters",
    accountId: "MC-400500600",
    accountName: "Widget Inc Merchant",
    productAttributes: {
      availability: "IN_STOCK" as const,
      productTypes: ["Food, Beverages & Tobacco > Beverages > Coffee"],
      productWeight: { value: 340, unit: "cm" as unknown as "in" },
    },
  }),
  makeProduct({
    offerId: "NMAD-GR-002",
    title: "Burr Coffee Grinder",
    price: "89990000",
    brand: "Baratza",
    accountId: "MC-400500600",
    accountName: "Widget Inc Merchant",
    productAttributes: {
      availability: "IN_STOCK" as const,
      productTypes: ["Home & Garden > Kitchen > Small Appliances"],
    },
  }),

  // Product with issues (for testing status display)
  makeProduct({
    offerId: "WIDG-ERR-005",
    title: "Wireless Earbuds Budget",
    price: "19990000",
    brand: "Generic",
    accountId: "MC-400500600",
    accountName: "Widget Inc Merchant",
    productAttributes: {
      availability: "IN_STOCK" as const,
      productTypes: ["Electronics > Audio > Headphones"],
    },
  }),
];

// Give the last product some issues for testing
MOCK_PRODUCTS[MOCK_PRODUCTS.length - 1].productStatus = {
  destinationStatuses: [
    { reportingContext: "SHOPPING_ADS", approvedCountries: [], pendingCountries: ["US"], disapprovedCountries: [] },
  ],
  itemLevelIssues: [
    {
      code: "missing_gtin",
      severity: "DEMOTED",
      resolution: "merchant_action",
      attribute: "gtin",
      reportingContext: "SHOPPING_ADS",
      description: "Missing GTIN",
      detail: "Add a valid GTIN to improve product visibility",
      documentation: "https://support.google.com/merchants/answer/6324461",
      applicableCountries: ["US"],
    },
    {
      code: "image_too_small",
      severity: "NOT_IMPACTED",
      resolution: "merchant_action",
      attribute: "imageLink",
      reportingContext: "SHOPPING_ADS",
      description: "Image too small",
      detail: "Product images should be at least 800x800 pixels",
      documentation: "https://support.google.com/merchants/answer/6324350",
      applicableCountries: ["US"],
    },
  ],
  creationDate: "2026-02-10T08:00:00Z",
  lastUpdateDate: "2026-03-30T11:00:00Z",
  googleExpirationDate: "2026-06-10T08:00:00Z",
};

// ─────────────────────────────────────────────────────────────────────────────
// Product-Campaign Links
// Maps product offerId → campaign IDs from mock-data.ts
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_PRODUCT_CAMPAIGN_LINKS: ProductCampaignLink[] = [
  // Acme products linked to Acme Shopping + PMax campaigns
  { productId: "ACME-RUN-001", campaignIds: ["6715028394", "9451637280"] },
  { productId: "ACME-TRL-002", campaignIds: ["6715028394", "9451637280"] },
  { productId: "ACME-BAG-003", campaignIds: ["6715028394"] },
  { productId: "ACME-JKT-004", campaignIds: ["9451637280"] },
  { productId: "ACME-SHR-005", campaignIds: ["6715028394", "9451637280"] },
  // Widget products linked to Widget Shopping campaign (if exists) — for now link to first Widget campaign
  { productId: "WIDG-KB-001", campaignIds: [] },
  { productId: "WIDG-MS-002", campaignIds: [] },
  { productId: "WIDG-MON-003", campaignIds: [] },
  { productId: "WIDG-WC-004", campaignIds: [] },
  // Pinnacle Fitness products linked to PMax
  { productId: "PINN-DB-001", campaignIds: ["9451637280"] },
  { productId: "PINN-YM-002", campaignIds: [] },
  { productId: "PINN-PRO-003", campaignIds: [] },
  // Nomad Roasters
  { productId: "NMAD-CB-001", campaignIds: [] },
  { productId: "NMAD-GR-002", campaignIds: [] },
  // Product with issues
  { productId: "WIDG-ERR-005", campaignIds: [] },
];
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/gmc/mock-data.ts
git commit -m "feat: add ~15 mock GMC products with campaign links across 4 accounts"
```

---

## Task 4: Product Fetch Logic + Seed Links

**Files:**
- Create: `lib/gmc/products.ts`
- Create: `lib/gmc/client.ts`
- Modify: `lib/tokens.ts` (seed product-campaign links)

- [ ] **Step 1: Create `lib/gmc/client.ts`**

```typescript
// lib/gmc/client.ts

const BASE_URL = "https://shoppingcontent.googleapis.com/content/v2.1";

export function merchantApiUrl(merchantId: string, path: string): string {
  return `${BASE_URL}/${merchantId}/${path}`;
}
```

- [ ] **Step 2: Create `lib/gmc/products.ts`**

```typescript
// lib/gmc/products.ts

import type { GmcProduct, GmcAccount } from "@/lib/types/gmc";
import { MOCK_PRODUCTS, MOCK_PRODUCT_CAMPAIGN_LINKS } from "./mock-data";
import { merchantApiUrl } from "./client";

export async function fetchProducts(accounts: GmcAccount[]): Promise<GmcProduct[]> {
  if (process.env.USE_MOCK_DATA === "true") {
    return MOCK_PRODUCTS;
  }

  const allProducts: GmcProduct[] = [];

  for (const account of accounts) {
    const res = await fetch(merchantApiUrl(account.merchantId, "products"), {
      headers: { Authorization: `Bearer ${account.accessToken}` },
    });

    if (!res.ok) continue;

    const data = await res.json();
    const products = (data.resources ?? []) as GmcProduct[];
    for (const product of products) {
      allProducts.push({ ...product, accountId: account.merchantId, accountName: account.name });
    }
  }

  return allProducts;
}

export async function fetchProductById(
  productId: string,
  accounts: GmcAccount[],
): Promise<GmcProduct | null> {
  if (process.env.USE_MOCK_DATA === "true") {
    return MOCK_PRODUCTS.find((p) => p.offerId === productId) ?? null;
  }

  const products = await fetchProducts(accounts);
  return products.find((p) => p.offerId === productId) ?? null;
}

export function getMockProductCampaignLinks() {
  return MOCK_PRODUCT_CAMPAIGN_LINKS;
}
```

- [ ] **Step 3: Seed product-campaign links in tokens.ts mock block**

In `lib/tokens.ts`, inside the mock seed block, add after the OAI MC seed:

```typescript
  // Seed product-campaign links
  if (tokens.productCampaignLinks.length === 0) {
    const { MOCK_PRODUCT_CAMPAIGN_LINKS } = require("@/lib/gmc/mock-data");
    tokens.productCampaignLinks = MOCK_PRODUCT_CAMPAIGN_LINKS;
  }
```

- [ ] **Step 4: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add lib/gmc/client.ts lib/gmc/products.ts lib/tokens.ts
git commit -m "feat: add GMC product fetch logic with mock/real modes and campaign link seeding"
```

---

## Task 5: OAI Merchant Center Mapper + Stub

**Files:**
- Create: `lib/oai-mc/mapper.ts`
- Create: `lib/oai-mc/stub.ts`

- [ ] **Step 1: Create `lib/oai-mc/mapper.ts`**

```typescript
// lib/oai-mc/mapper.ts

import type { GmcProduct, OaiMcProductDraft } from "@/lib/types/gmc";

export function mapProduct(product: GmcProduct): OaiMcProductDraft {
  const attrs = product.productAttributes;
  return {
    title: attrs.title,
    description: attrs.description,
    link: attrs.link,
    imageLink: attrs.imageLink,
    availability: attrs.availability,
    brand: attrs.brand,
    price: {
      amountMicros: attrs.price.amountMicros,
      currencyCode: attrs.price.currencyCode,
    },
    productTypes: attrs.productTypes,
    offerId: product.offerId,
  };
}

export function countProductMappingResults(draft: OaiMcProductDraft): { mapped: number; actionNeeded: number } {
  let mapped = 0;
  let actionNeeded = 0;

  if (draft.title) mapped++; else actionNeeded++;
  if (draft.description) mapped++; else actionNeeded++;
  if (draft.link) mapped++; else actionNeeded++;
  if (draft.imageLink) mapped++; else actionNeeded++;
  if (draft.brand) mapped++; else actionNeeded++;
  if (draft.price.amountMicros) mapped++; else actionNeeded++;
  if (draft.offerId) mapped++; else actionNeeded++;
  mapped++; // availability always maps

  return { mapped, actionNeeded };
}
```

- [ ] **Step 2: Create `lib/oai-mc/stub.ts`**

```typescript
// lib/oai-mc/stub.ts

import type { OaiMcProductDraft, OaiMcCopyResponse } from "@/lib/types/gmc";

export async function createOaiMcDraft(draft: OaiMcProductDraft): Promise<OaiMcCopyResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));

  const warnings: string[] = [];
  if (!draft.title) warnings.push("Product title is missing");
  if (!draft.description) warnings.push("Product description is missing");
  if (!draft.imageLink) warnings.push("Product image is missing");

  return {
    draft_id: crypto.randomUUID(),
    product_title: draft.title,
    status: "DRAFT",
    created_at: new Date().toISOString(),
    warnings,
  };
}
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add lib/oai-mc/mapper.ts lib/oai-mc/stub.ts
git commit -m "feat: add OAI Merchant Center product mapper and draft stub"
```

---

## Task 6: GMC API Routes (Auth + Accounts)

**Files:**
- Create: `app/api/gmc/connect/route.ts`
- Create: `app/api/gmc/callback/route.ts`
- Create: `app/api/gmc/accounts/route.ts`
- Create: `app/api/gmc/accounts/[id]/route.ts`

- [ ] **Step 1: Create GMC connect route**

```typescript
// app/api/gmc/connect/route.ts

import { getUserId } from "@/lib/get-user-id";
import { redirect } from "next/navigation";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_MC_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/gmc/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/content",
    access_type: "offline",
    prompt: "consent",
    state: userId,
  });

  redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
```

- [ ] **Step 2: Create GMC callback route**

```typescript
// app/api/gmc/callback/route.ts

import { addGmcAccount } from "@/lib/tokens";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const userId = request.nextUrl.searchParams.get("state");

  if (!code || !userId) {
    redirect("/dashboard?error=gmc_oauth_failed");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_MC_CLIENT_ID!,
      client_secret: process.env.GOOGLE_MC_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/gmc/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    redirect("/dashboard?error=gmc_token_exchange_failed");
  }

  const tokens = await tokenResponse.json();

  addGmcAccount(userId, {
    merchantId: "MC-" + Date.now(),
    name: "Merchant Center Account",
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  });

  redirect("/dashboard/settings?gmc_connected=true");
}
```

- [ ] **Step 3: Create GMC accounts list route**

```typescript
// app/api/gmc/accounts/route.ts

import { getUserId } from "@/lib/get-user-id";
import { getGmcAccounts } from "@/lib/tokens";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = getGmcAccounts(userId);
  const safeAccounts = accounts.map(({ merchantId, name }) => ({ merchantId, name }));

  return Response.json({ accounts: safeAccounts });
}
```

- [ ] **Step 4: Create GMC account disconnect route**

```typescript
// app/api/gmc/accounts/[id]/route.ts

import { getUserId } from "@/lib/get-user-id";
import { removeGmcAccount } from "@/lib/tokens";
import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  removeGmcAccount(userId, id);
  return Response.json({ success: true });
}
```

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add app/api/gmc/
git commit -m "feat: add GMC OAuth connect/callback and account management routes"
```

---

## Task 7: GMC Product API Routes + Link Routes

**Files:**
- Create: `app/api/gmc/products/route.ts`
- Create: `app/api/gmc/products/[id]/route.ts`
- Create: `app/api/gmc/products/[id]/campaigns/route.ts`
- Create: `app/api/gads/campaigns/[id]/products/route.ts`

- [ ] **Step 1: Create products list route**

```typescript
// app/api/gmc/products/route.ts

import { getUserId } from "@/lib/get-user-id";
import { getGmcAccounts } from "@/lib/tokens";
import { fetchProducts } from "@/lib/gmc/products";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = getGmcAccounts(userId);
  const products = await fetchProducts(accounts);

  return Response.json({ products });
}
```

- [ ] **Step 2: Create single product detail route**

```typescript
// app/api/gmc/products/[id]/route.ts

import { getUserId } from "@/lib/get-user-id";
import { getGmcAccounts } from "@/lib/tokens";
import { fetchProductById } from "@/lib/gmc/products";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const accounts = getGmcAccounts(userId);
  const product = await fetchProductById(id, accounts);

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json({ product });
}
```

- [ ] **Step 3: Create product→campaigns link route**

```typescript
// app/api/gmc/products/[id]/campaigns/route.ts

import { getUserId } from "@/lib/get-user-id";
import { getCampaignIdsForProduct, getGadsAccounts } from "@/lib/tokens";
import { fetchCampaigns } from "@/lib/gads/campaigns";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const campaignIds = getCampaignIdsForProduct(userId, id);

  if (campaignIds.length === 0) {
    return Response.json({ campaigns: [] });
  }

  const accounts = getGadsAccounts(userId);
  const allCampaigns = await fetchCampaigns(accounts);
  const linked = allCampaigns.filter((c) => campaignIds.includes(c.id));

  return Response.json({ campaigns: linked });
}
```

- [ ] **Step 4: Create campaign→products link route**

```typescript
// app/api/gads/campaigns/[id]/products/route.ts

import { getUserId } from "@/lib/get-user-id";
import { getProductIdsForCampaign, getGmcAccounts } from "@/lib/tokens";
import { fetchProducts } from "@/lib/gmc/products";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productIds = getProductIdsForCampaign(userId, id);

  if (productIds.length === 0) {
    return Response.json({ products: [] });
  }

  const accounts = getGmcAccounts(userId);
  const allProducts = await fetchProducts(accounts);
  const linked = allProducts.filter((p) => productIds.includes(p.offerId));

  return Response.json({ products: linked });
}
```

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add app/api/gmc/products/ app/api/gads/campaigns/\[id\]/products/
git commit -m "feat: add product list/detail and product-campaign link API routes"
```

---

## Task 8: OAI Merchant Center API Routes

**Files:**
- Create: `app/api/oai-mc/token/route.ts`
- Create: `app/api/oai-mc/copy/route.ts`

- [ ] **Step 1: Create OAI MC token route**

```typescript
// app/api/oai-mc/token/route.ts

import { getUserId } from "@/lib/get-user-id";
import {
  setOaiMcToken,
  getOaiMcConnection,
  removeOaiMcConnection,
} from "@/lib/tokens";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const connection = getOaiMcConnection(userId);
  if (!connection) {
    return Response.json({ hasToken: false });
  }
  return Response.json({
    hasToken: true,
    name: connection.name,
    maskedId: connection.maskedId,
  });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { token, name } = await request.json();
  setOaiMcToken(userId, token, name);
  return Response.json({ success: true });
}

export async function DELETE() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  removeOaiMcConnection(userId);
  return Response.json({ success: true });
}
```

- [ ] **Step 2: Create OAI MC copy route**

```typescript
// app/api/oai-mc/copy/route.ts

import { getUserId } from "@/lib/get-user-id";
import { createOaiMcDraft } from "@/lib/oai-mc/stub";
import { addActivity } from "@/lib/tokens";
import type { OaiMcProductDraft } from "@/lib/types/gmc";

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { source_product_id, with_campaign, ...draftFields } = body;
  const draft: OaiMcProductDraft = draftFields;
  const result = await createOaiMcDraft(draft);

  addActivity(userId, {
    campaignName: draft.title,
    campaignId: source_product_id,
    action: with_campaign ? "product_copied_with_campaign" : "product_copied",
  });

  return Response.json(result);
}
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/oai-mc/
git commit -m "feat: add OAI Merchant Center token management and product copy routes"
```

---

## Task 9: Sidebar + Navigation Update

**Files:**
- Modify: `components/app-sidebar.tsx`

- [ ] **Step 1: Add Products nav item**

In `components/app-sidebar.tsx`, add the `Package` import:
```typescript
import { LayoutDashboard, Megaphone, Settings, Package } from "lucide-react";
```

Add Products to `NAV_ITEMS`:
```typescript
const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/campaigns", icon: Megaphone, label: "Campaigns" },
  { href: "/dashboard/products", icon: Package, label: "Products" },
];
```

- [ ] **Step 2: Verify the app builds**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds (or at least no errors in app-sidebar).

- [ ] **Step 3: Commit**

```bash
git add components/app-sidebar.tsx
git commit -m "feat: add Products nav item to sidebar"
```

---

## Task 10: Settings Page — GMC + OAI MC Sections

**Files:**
- Modify: `app/dashboard/settings/page.tsx`

- [ ] **Step 1: Add GMC and OAI MC state variables**

In `SettingsPage`, add new state after existing ones:
```typescript
const [gmcAccounts, setGmcAccounts] = useState<{ merchantId: string; name: string }[]>([]);
const [oaiMcConnection, setOaiMcConnection] = useState<{ hasToken: boolean; name?: string; maskedId?: string }>({ hasToken: false });
const [mcTokenDialogOpen, setMcTokenDialogOpen] = useState(false);
const [mcTokenInput, setMcTokenInput] = useState("");
const [mcTokenNameInput, setMcTokenNameInput] = useState("OpenAI Merchant Center");
const [mcTokenSaving, setMcTokenSaving] = useState(false);
```

- [ ] **Step 2: Extend fetchData to load GMC + OAI MC data**

Update the `fetchData` function's `Promise.all` to include the new endpoints:
```typescript
const fetchData = useCallback(async () => {
  try {
    const [accountsRes, oaiRes, gmcRes, oaiMcRes] = await Promise.all([
      fetch("/api/gads/accounts"),
      fetch("/api/oai/token"),
      fetch("/api/gmc/accounts"),
      fetch("/api/oai-mc/token"),
    ]);
    const { accounts } = await accountsRes.json();
    const oaiData = await oaiRes.json();
    const gmcData = await gmcRes.json();
    const oaiMcData = await oaiMcRes.json();
    setGadsAccounts(accounts || []);
    setOaiConnection(oaiData);
    setGmcAccounts(gmcData.accounts || []);
    setOaiMcConnection(oaiMcData);
  } catch { toast.error("Failed to load account data"); }
  finally { setLoading(false); }
}, []);
```

- [ ] **Step 3: Add GMC disconnect and OAI MC token handlers**

Add after existing handlers:
```typescript
async function disconnectGmc(merchantId: string) {
  try {
    await fetch(`/api/gmc/accounts/${merchantId}`, { method: "DELETE" });
    setGmcAccounts((prev) => prev.filter((a) => a.merchantId !== merchantId));
    toast.success("Merchant Center account disconnected");
  } catch { toast.error("Failed to disconnect account"); }
}

async function handleOaiMcTokenSubmit() {
  if (!mcTokenInput.trim()) return;
  setMcTokenSaving(true);
  try {
    const res = await fetch("/api/oai-mc/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: mcTokenInput.trim(), name: mcTokenNameInput.trim() || "OpenAI Merchant Center" }),
    });
    if (!res.ok) throw new Error();
    setMcTokenDialogOpen(false); setMcTokenInput(""); setMcTokenNameInput("OpenAI Merchant Center");
    toast.success("OpenAI Merchant Center connected");
    fetchData();
  } catch { toast.error("Failed to save token"); }
  finally { setMcTokenSaving(false); }
}

async function disconnectOaiMc() {
  try {
    await fetch("/api/oai-mc/token", { method: "DELETE" });
    setOaiMcConnection({ hasToken: false });
    toast.success("OpenAI Merchant Center disconnected");
  } catch { toast.error("Failed to disconnect"); }
}
```

- [ ] **Step 4: Add GMC Card after Google Ads Card, and OAI MC Card after OAI Ads Card**

Add the `Store` icon import:
```typescript
import { Plus, Building2, Unplug, Plug, Store } from "lucide-react";
```

After the Google Ads `<Card>`, add:
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg">Google Merchant Center</CardTitle>
      <Button size="sm" variant="outline" asChild>
        <a href="/api/gmc/connect"><Plus className="mr-2 h-4 w-4" />Connect Account</a>
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    {gmcAccounts.length === 0 ? (
      <EmptyState icon={Store} title="No Merchant Center accounts" description="Connect a Google Merchant Center account to manage products."
        action={<Button size="sm" asChild><a href="/api/gmc/connect">Connect Account</a></Button>} />
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Merchant ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gmcAccounts.map((account) => (
            <TableRow key={account.merchantId}>
              <TableCell className="font-medium">{account.name}</TableCell>
              <TableCell className="font-mono text-sm">{account.merchantId}</TableCell>
              <TableCell><Badge className="bg-[var(--color-status-enabled)] text-white">Connected</Badge></TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm"><Unplug className="h-4 w-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect {account.name}?</AlertDialogTitle>
                      <AlertDialogDescription>This will remove access to products from this account.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => disconnectGmc(account.merchantId)}>Disconnect</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </CardContent>
</Card>
```

After the OpenAI Ads `<Card>`, add:
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg">OpenAI Merchant Center</CardTitle>
      {!oaiMcConnection.hasToken && (
        <Button size="sm" onClick={() => setMcTokenDialogOpen(true)}><Plug className="mr-2 h-4 w-4" />Connect</Button>
      )}
    </div>
  </CardHeader>
  <CardContent>
    {oaiMcConnection.hasToken ? (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">{oaiMcConnection.name || "OpenAI Merchant Center"}</TableCell>
            <TableCell className="font-mono text-sm">{oaiMcConnection.maskedId}</TableCell>
            <TableCell><Badge className="bg-[var(--color-status-enabled)] text-white">Connected</Badge></TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => setMcTokenDialogOpen(true)}>Update</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm"><Unplug className="h-4 w-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect OpenAI Merchant Center?</AlertDialogTitle>
                      <AlertDialogDescription>This will remove your Merchant Center API token.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={disconnectOaiMc}>Disconnect</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ) : (
      <EmptyState icon={Store} title="No OpenAI Merchant Center" description="Connect your OpenAI Merchant Center API token to copy products."
        action={<Button size="sm" onClick={() => setMcTokenDialogOpen(true)}>Connect Account</Button>} />
    )}
  </CardContent>
</Card>
```

- [ ] **Step 5: Add OAI MC token dialog**

After the existing OAI token `<Dialog>`, add:
```tsx
<Dialog open={mcTokenDialogOpen} onOpenChange={setMcTokenDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Connect OpenAI Merchant Center</DialogTitle>
      <DialogDescription>Enter your OpenAI Merchant Center API token.</DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="oai-mc-name">Account Name</Label>
        <Input id="oai-mc-name" value={mcTokenNameInput} onChange={(e) => setMcTokenNameInput(e.target.value)} placeholder="OpenAI Merchant Center" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="oai-mc-token">API Token</Label>
        <Input id="oai-mc-token" type="password" value={mcTokenInput} onChange={(e) => setMcTokenInput(e.target.value)} placeholder="Enter your API token" onKeyDown={(e) => e.key === "Enter" && handleOaiMcTokenSubmit()} />
      </div>
    </div>
    <DialogFooter>
      <Button onClick={handleOaiMcTokenSubmit} disabled={mcTokenSaving || !mcTokenInput.trim()}>
        {mcTokenSaving ? "Saving..." : "Connect"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

- [ ] **Step 6: Verify the dev server renders settings**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add app/dashboard/settings/page.tsx
git commit -m "feat: add GMC and OAI Merchant Center sections to settings page"
```

---

## Task 11: Product Filter Bar Component

**Files:**
- Create: `components/product-filter-bar.tsx`

- [ ] **Step 1: Create `components/product-filter-bar.tsx`**

```typescript
// components/product-filter-bar.tsx

"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal, X } from "lucide-react";
import type { GmcProduct, GmcAvailability } from "@/lib/types/gmc";

export interface ProductFilters {
  account: string[];
  availability: GmcAvailability[];
  brand: string[];
}

const EMPTY_FILTERS: ProductFilters = { account: [], availability: [], brand: [] };

const FRIENDLY_AVAILABILITY: Record<string, string> = {
  IN_STOCK: "In Stock",
  OUT_OF_STOCK: "Out of Stock",
  PREORDER: "Preorder",
  LIMITED_AVAILABILITY: "Limited",
  BACKORDER: "Backorder",
  AVAILABILITY_UNSPECIFIED: "Unspecified",
};

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  friendlyNames?: Record<string, string>;
}

function MultiSelectFilter({ label, options, selected, onChange, friendlyNames }: MultiSelectFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          {label}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">{selected.length}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start">
        <div className="space-y-1">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer">
              <Checkbox
                checked={selected.includes(opt)}
                onCheckedChange={(checked) => {
                  onChange(checked ? [...selected, opt] : selected.filter((s) => s !== opt));
                }}
              />
              {friendlyNames?.[opt] ?? opt}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ProductFilterBarProps {
  products: GmcProduct[];
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export function ProductFilterBar({ products, filters, onFiltersChange }: ProductFilterBarProps) {
  const accountOptions = useMemo(() => [...new Set(products.map((p) => p.accountName))].sort(), [products]);
  const availabilityOptions = useMemo(() => [...new Set(products.map((p) => p.productAttributes.availability))].sort(), [products]);
  const brandOptions = useMemo(() => [...new Set(products.map((p) => p.productAttributes.brand).filter(Boolean))].sort(), [products]);

  return (
    <>
      <MultiSelectFilter label="Account" options={accountOptions} selected={filters.account} onChange={(v) => onFiltersChange({ ...filters, account: v })} />
      <MultiSelectFilter label="Availability" options={availabilityOptions} selected={filters.availability} onChange={(v) => onFiltersChange({ ...filters, availability: v as GmcAvailability[] })} friendlyNames={FRIENDLY_AVAILABILITY} />
      <MultiSelectFilter label="Brand" options={brandOptions} selected={filters.brand} onChange={(v) => onFiltersChange({ ...filters, brand: v })} />
    </>
  );
}

interface ProductFilterChipsProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export function ProductFilterChips({ filters, onFiltersChange }: ProductFilterChipsProps) {
  const chips: { key: keyof ProductFilters; value: string; label: string }[] = [];
  for (const v of filters.account) chips.push({ key: "account", value: v, label: v });
  for (const v of filters.availability) chips.push({ key: "availability", value: v, label: FRIENDLY_AVAILABILITY[v] ?? v });
  for (const v of filters.brand) chips.push({ key: "brand", value: v, label: v });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <Badge key={`${chip.key}-${chip.value}`} variant="secondary" className="gap-1 pr-1">
          {chip.label}
          <button
            type="button"
            onClick={() => {
              onFiltersChange({
                ...filters,
                [chip.key]: (filters[chip.key] as string[]).filter((v) => v !== chip.value),
              });
            }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-background/50"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onFiltersChange(EMPTY_FILTERS)}>
        Clear all
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/product-filter-bar.tsx
git commit -m "feat: add product filter bar component with account/availability/brand filters"
```

---

## Task 12: Product Table Component

**Files:**
- Create: `components/product-table.tsx`

- [ ] **Step 1: Create `components/product-table.tsx`**

This component mirrors `CampaignTable` — search, sort, filter, row actions. Due to the file's length, the worker should follow the exact `CampaignTable` pattern but with these columns:

| Column | Sort Key | Value |
|--------|----------|-------|
| Image | — (not sortable) | `productAttributes.imageLink` as 36x36 thumbnail |
| Title | `title` | `productAttributes.title` + `offerId` below |
| Price | `price` | `productAttributes.price` formatted as `$X.XX` |
| Availability | `availability` | Badge with friendly name |
| Brand | `brand` | `productAttributes.brand` |
| Status | — | Issue count badge or "Approved" |
| Campaigns | — | Count of linked campaigns |
| Actions | — | "View" button → sheet detail, "Copy to OAI" button → `/dashboard/products/copy/[offerId]` |

Use `ProductFilterBar` and `ProductFilterChips` from Task 11. Use `Sheet` for product detail (like campaign table). Use the `microsToUsd` and `formatBudget` utils from `lib/utils` to format prices.

The component receives `products: GmcProduct[]` and `productCampaignLinks: ProductCampaignLink[]` as props.

Row actions:
- "View" opens a `Sheet` with `ProductDetail` (Task 13)
- "Copy to OAI" navigates to `/dashboard/products/copy/[offerId]`

Availability badge colors:
- `IN_STOCK` → green
- `OUT_OF_STOCK` → red
- `PREORDER` → blue
- `LIMITED_AVAILABILITY` → yellow
- `BACKORDER` → orange

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add components/product-table.tsx
git commit -m "feat: add product table with search, sort, filters, and row actions"
```

---

## Task 13: Product Detail Component

**Files:**
- Create: `components/product-detail.tsx`

- [ ] **Step 1: Create `components/product-detail.tsx`**

Follow the `CampaignDetail` pattern — collapsible sections with smooth animations. Sections:

1. **Core Info** — title, description, offerId, brand, color, availability, content language, feed label
2. **Pricing** — price, sale price, sale price effective date, automated discounts
3. **Images** — main image (rendered as `<img>`), additional image links
4. **Dimensions** — height, length, width, weight
5. **Categories** — product types, GTINs
6. **Status** — destination statuses (approved/pending/disapproved countries per reporting context)
7. **Issues** — item-level issues list with severity badges, descriptions, resolution
8. **Linked Campaigns** — fetched from `/api/gmc/products/[id]/campaigns`, shown as compact cards with campaign name, type badge, "View →" link to `/dashboard/campaigns`

Props: `product: GmcProduct`

Use `microsToUsd` for price formatting. Use collapsible sections with `ChevronDown` icon animation (same pattern as `CampaignDetail`).

The Linked Campaigns section should fetch data on mount via `useEffect` and show a loading skeleton while loading.

- [ ] **Step 2: Commit**

```bash
git add components/product-detail.tsx
git commit -m "feat: add product detail component with collapsible sections and linked campaigns"
```

---

## Task 14: Products Page

**Files:**
- Create: `app/dashboard/products/page.tsx`

- [ ] **Step 1: Create `app/dashboard/products/page.tsx`**

Follow the exact pattern of `app/dashboard/campaigns/page.tsx`:

```typescript
// app/dashboard/products/page.tsx

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductTable } from "@/components/product-table";
import { EmptyState } from "@/components/empty-state";
import type { GmcProduct, ProductCampaignLink } from "@/lib/types/gmc";

export default function ProductsPage() {
  const [products, setProducts] = useState<GmcProduct[]>([]);
  const [links, setLinks] = useState<ProductCampaignLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/gmc/products");
        if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
        const data = await res.json();
        if (!cancelled) {
          setProducts(data.products ?? []);
          setLinks(data.links ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          toast.error("Failed to load products");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <EmptyState icon={AlertCircle} title="Failed to load products" description={error} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <EmptyState
          icon={Package}
          title="No products found"
          description="Connect a Google Merchant Center account to see your products here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Products</h1>
      <ProductTable products={products} productCampaignLinks={links} />
    </div>
  );
}
```

Note: Update the products API route to also return links. In `app/api/gmc/products/route.ts`, add:
```typescript
import { getProductCampaignLinks } from "@/lib/tokens";
// ... in GET handler, after fetching products:
const links = getProductCampaignLinks(userId);
return Response.json({ products, links });
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/products/page.tsx app/api/gmc/products/route.ts
git commit -m "feat: add products list page with table, filters, and search"
```

---

## Task 15: Product Detail Page

**Files:**
- Create: `app/dashboard/products/[id]/page.tsx`

- [ ] **Step 1: Create product detail page**

```typescript
// app/dashboard/products/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Package, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ProductDetail } from "@/components/product-detail";
import Link from "next/link";
import type { GmcProduct } from "@/lib/types/gmc";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<GmcProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/gmc/products/${params.id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        if (!cancelled) setProduct(data.product);
      } catch {
        if (!cancelled) toast.error("Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!product) {
    return <EmptyState icon={Package} title="Product not found" description="This product could not be loaded." />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{product.productAttributes.title}</h1>
      </div>
      <Button asChild>
        <Link href={`/dashboard/products/copy/${product.offerId}`}>
          <Copy className="mr-2 h-4 w-4" />Copy to OAI
        </Link>
      </Button>
      <ProductDetail product={product} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/products/\[id\]/page.tsx
git commit -m "feat: add product detail page"
```

---

## Task 16: Product Copy Split-Pane + Copy Page

**Files:**
- Create: `components/product-copy-split-pane.tsx`
- Create: `app/dashboard/products/copy/[productId]/page.tsx`

- [ ] **Step 1: Create `components/product-copy-split-pane.tsx`**

Follow the `CloneSplitPane` pattern but simplified for products (no ad groups/creatives hierarchy). Left pane shows the GMC product fields read-only. Right pane shows editable OAI MC draft fields.

Key fields to display in both panes:
- Title
- Description
- Link / URL
- Image (rendered as thumbnail)
- Price (formatted)
- Availability
- Brand
- Product Types
- Offer ID

The component accepts:
```typescript
interface ProductCopySplitPaneProps {
  product: GmcProduct;
  draft: OaiMcProductDraft;
  onDraftChange: (draft: OaiMcProductDraft) => void;
}
```

Include the draggable divider (20%-65% range, default 42%) and mapping indicators ("auto-mapped" vs "needs input") following the same pattern as `CloneSplitPane`.

- [ ] **Step 2: Create the copy page**

```typescript
// app/dashboard/products/copy/[productId]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Package, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ProductCopySplitPane } from "@/components/product-copy-split-pane";
import { mapProduct, countProductMappingResults } from "@/lib/oai-mc/mapper";
import Link from "next/link";
import type { GmcProduct, OaiMcProductDraft } from "@/lib/types/gmc";

export default function ProductCopyPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<GmcProduct | null>(null);
  const [draft, setDraft] = useState<OaiMcProductDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/gmc/products/${params.productId}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        if (!cancelled) {
          setProduct(data.product);
          setDraft(mapProduct(data.product));
        }
      } catch {
        if (!cancelled) toast.error("Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [params.productId]);

  async function handleSubmit() {
    if (!draft || !product) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/oai-mc/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, source_product_id: product.offerId }),
      });
      if (!res.ok) throw new Error("Failed to create draft");
      const result = await res.json();
      toast.success(`Product draft created: ${result.product_title}`);
      if (result.warnings?.length > 0) {
        for (const w of result.warnings) toast.warning(w);
      }
      router.push("/dashboard/products");
    } catch {
      toast.error("Failed to copy product");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[60vh]" />
      </div>
    );
  }

  if (!product || !draft) {
    return <EmptyState icon={Package} title="Product not found" description="This product could not be loaded." />;
  }

  const { mapped, actionNeeded } = countProductMappingResults(draft);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/products"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Copy Product to OAI</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{mapped} mapped</Badge>
          {actionNeeded > 0 && <Badge variant="outline" className="text-amber-600">{actionNeeded} need input</Badge>}
          <Button onClick={handleSubmit} disabled={submitting} className="rounded-full">
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "Creating..." : "Create Draft"}
          </Button>
        </div>
      </div>
      <ProductCopySplitPane product={product} draft={draft} onDraftChange={setDraft} />
    </div>
  );
}
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add components/product-copy-split-pane.tsx app/dashboard/products/copy/
git commit -m "feat: add product copy split-pane and copy page"
```

---

## Task 17: Product Toggle List for Campaign Clone

**Files:**
- Create: `components/product-toggle-list.tsx`
- Modify: `app/dashboard/clone/[campaignId]/page.tsx`

- [ ] **Step 1: Create `components/product-toggle-list.tsx`**

```typescript
// components/product-toggle-list.tsx

"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckSquare, Square } from "lucide-react";
import { microsToUsd, formatBudget } from "@/lib/utils";
import type { GmcProduct } from "@/lib/types/gmc";

interface ProductToggleListProps {
  products: GmcProduct[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function ProductToggleList({ products, selectedIds, onSelectionChange }: ProductToggleListProps) {
  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const noneSelected = selectedIds.length === 0;

  function toggleAll() {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(products.map((p) => p.offerId));
    }
  }

  function toggleProduct(offerId: string) {
    if (selectedIds.includes(offerId)) {
      onSelectionChange(selectedIds.filter((id) => id !== offerId));
    } else {
      onSelectionChange([...selectedIds, offerId]);
    }
  }

  if (products.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Linked Products ({products.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={toggleAll} className="gap-1.5">
            {allSelected ? <Square className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
            {allSelected ? "Deselect All" : "Select All"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Select products to also copy to OpenAI Merchant Center
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {products.map((product) => {
            const attrs = product.productAttributes;
            const checked = selectedIds.includes(product.offerId);
            return (
              <label
                key={product.offerId}
                className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleProduct(product.offerId)} />
                <img
                  src={attrs.imageLink}
                  alt={attrs.title}
                  className="h-9 w-9 rounded object-cover bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{attrs.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatBudget(microsToUsd(Number(attrs.price.amountMicros)))} {attrs.price.currencyCode} · {attrs.brand}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Modify the clone page to fetch and show linked products**

In `app/dashboard/clone/[campaignId]/page.tsx`, add the following changes:

Add imports:
```typescript
import { ProductToggleList } from "@/components/product-toggle-list";
import type { GmcProduct } from "@/lib/types/gmc";
```

Add state:
```typescript
const [linkedProducts, setLinkedProducts] = useState<GmcProduct[]>([]);
const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
```

In the existing `useEffect` data loading, after fetching campaign/adgroups/ads, add:
```typescript
// Fetch linked products
const productsRes = await fetch(`/api/gads/campaigns/${campaignId}/products`);
if (productsRes.ok) {
  const productsData = await productsRes.json();
  const prods = productsData.products ?? [];
  setLinkedProducts(prods);
  setSelectedProductIds(prods.map((p: GmcProduct) => p.offerId));
}
```

In the submit handler, after the existing `POST /api/oai/clone`, add:
```typescript
// Copy selected products to OAI MC
if (selectedProductIds.length > 0) {
  for (const product of linkedProducts.filter((p) => selectedProductIds.includes(p.offerId))) {
    const { mapProduct } = await import("@/lib/oai-mc/mapper");
    const productDraft = mapProduct(product);
    await fetch("/api/oai-mc/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...productDraft, source_product_id: product.offerId, with_campaign: true }),
    });
  }
}
```

In the JSX, after the `CloneSplitPane` and before the submit button area, add:
```tsx
{linkedProducts.length > 0 && (
  <ProductToggleList
    products={linkedProducts}
    selectedIds={selectedProductIds}
    onSelectionChange={setSelectedProductIds}
  />
)}
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add components/product-toggle-list.tsx app/dashboard/clone/\[campaignId\]/page.tsx
git commit -m "feat: add product toggle list to campaign clone flow"
```

---

## Task 18: Dashboard Stats + Campaign Detail Cross-Links

**Files:**
- Modify: `app/dashboard/page.tsx`
- Modify: `components/campaign-detail.tsx`

- [ ] **Step 1: Add Total Products stat card to dashboard**

In `app/dashboard/page.tsx`:

Add import:
```typescript
import { Package } from "lucide-react";
import type { GmcProduct } from "@/lib/types/gmc";
```

Add state:
```typescript
const [products, setProducts] = useState<GmcProduct[]>([]);
```

In the existing `useEffect` `Promise.all`, add a fourth fetch:
```typescript
fetch("/api/gmc/products"),
```

And extract:
```typescript
const prodData = await prodRes.json();
setProducts(prodData.products ?? []);
```

Change the grid from `grid-cols-3` to `grid-cols-4` and add:
```tsx
<Card>
  <CardContent className="pt-6">
    <div className="flex items-center gap-3">
      <Package className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Products</p>
        <p className="text-2xl font-bold">{products.length}</p>
      </div>
    </div>
  </CardContent>
</Card>
```

- [ ] **Step 2: Add linked products to campaign detail**

In `components/campaign-detail.tsx`, add a "Linked Products" section at the end. This section fetches from `/api/gads/campaigns/[id]/products` on mount and shows a compact list of product cards (image, title, price, "View →" link).

Add the fetch in a `useEffect` that triggers when the campaign prop changes. Show a `Skeleton` while loading, and show "No linked products" if empty.

Each product card links to `/dashboard/products/[offerId]`.

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx components/campaign-detail.tsx
git commit -m "feat: add products stat card to dashboard and linked products to campaign detail"
```

---

## Task 19: Environment Variables + Final Verification

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add GMC env vars to `.env.local`**

Add to `.env.local`:
```
GOOGLE_MC_CLIENT_ID=placeholder
GOOGLE_MC_CLIENT_SECRET=placeholder
```

- [ ] **Step 2: Full build verification**

Run: `npx next build 2>&1 | tail -30`
Expected: Build succeeds with all new routes compiled.

- [ ] **Step 3: Dev server smoke test**

Run: `npx next dev` and verify:
1. Products nav item appears in sidebar
2. `/dashboard/products` shows 15 mock products
3. `/dashboard/settings` shows all 4 sections
4. Product detail sheet opens from table
5. Copy to OAI flow works from product row
6. Dashboard shows 4 stat cards
7. Campaign detail shows linked products

- [ ] **Step 4: Commit**

```bash
git add .env.local
git commit -m "feat: add GMC environment variable placeholders"
```

- [ ] **Step 5: Final commit with all remaining changes**

```bash
git add -A
git commit -m "feat: complete Google Merchant Center integration"
```
