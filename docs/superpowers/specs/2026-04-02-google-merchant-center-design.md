# Google Merchant Center Integration — Design Spec

## Overview

Add Google Merchant Center (GMC) integration to Liftometer alongside the existing Google Ads flow. This includes a new Products section, GMC OAuth connection, product-to-campaign cross-linking, product copy-to-OAI flow, and OpenAI Merchant Center settings.

## Architecture Decision

**Mirror Architecture** — Follow the exact same patterns as the existing `gads` integration. New `gmc` module parallel to `gads`, new `oai-mc` module parallel to `oai`. Zero changes to existing code structure.

## Authentication

### Google Merchant Center OAuth (Separate from Google Ads)

- Separate OAuth 2.0 flow with scope: `https://www.googleapis.com/auth/content`
- Users may use different Google accounts for Ads and Merchant Center
- Own connect/callback routes, own token storage
- Uses the Content API for Shopping v2.1 (stable, mature)

### OpenAI Merchant Center

- Separate token-based connection (mirrors existing OAI Ads token flow)
- Own section in settings, own token storage

## Data Model

### Types (`lib/types/gmc.ts`)

All 9 entities from the Merchant API spec:

**1. GmcProduct**
- `name: string` — Format: `accounts/{account}/products/{product}`
- `offerId: string`
- `contentLanguage: string` — ISO 639-1 two-letter code
- `feedLabel: string` — Max 20 chars, A-Z, 0-9, hyphen, underscore
- `dataSource: string`
- `legacyLocal: boolean`
- `productAttributes: GmcProductAttributes`
- `customAttributes: GmcCustomAttribute[]`
- `productStatus: GmcProductStatus`
- `automatedDiscounts: GmcAutomatedDiscounts`
- `versionNumber: string` (int64 format)

**2. GmcProductAttributes**
- `title: string`
- `description: string`
- `link: string` — URL to product page
- `mobileLink: string`
- `imageLink: string`
- `additionalImageLinks: string[]`
- `availability: 'AVAILABILITY_UNSPECIFIED' | 'IN_STOCK' | 'OUT_OF_STOCK' | 'PREORDER' | 'LIMITED_AVAILABILITY' | 'BACKORDER'`
- `brand: string`
- `color: string`
- `price: GmcPrice`
- `salePrice: GmcPrice`
- `salePriceEffectiveDate: object` (Interval)
- `productTypes: string[]`
- `productHeight: GmcProductDimension`
- `productLength: GmcProductDimension`
- `productWidth: GmcProductDimension`
- `productWeight: GmcProductDimension`
- `expirationDate: string` (ISO 8601)
- `disclosureDate: string` (ISO 8601)
- `availabilityDate: string` (ISO 8601)
- `gtins: string[]`
- `loyaltyPrograms: object[]`
- `installment: object`
- `subscriptionCost: object`

**3. GmcCustomAttribute**
- `name: string`
- `value: string`
- `groupValues: object[]`

**4. GmcProductStatus**
- `destinationStatuses: GmcDestinationStatus[]`
- `itemLevelIssues: GmcItemLevelIssue[]`
- `creationDate: string` (ISO 8601)
- `lastUpdateDate: string` (ISO 8601)
- `googleExpirationDate: string` (ISO 8601)

**5. GmcAutomatedDiscounts**
- `priorPrice: GmcPrice`
- `priorPriceProgressive: GmcPrice`
- `gadPrice: GmcPrice`

**6. GmcPrice**
- `amountMicros: string` (int64, 1M micros = 1 currency unit)
- `currencyCode: string` (ISO 4217)

**7. GmcProductDimension**
- `value: number` (max 4 decimal places)
- `unit: string` ("in" | "cm")

**ReportingContextEnum** (shared by DestinationStatus and ItemLevelIssue):
`REPORTING_CONTEXT_ENUM_UNSPECIFIED` | `SHOPPING_ADS` | `DEMAND_GEN_ADS` | `DEMAND_GEN_ADS_DISCOVER_SURFACE` | `VIDEO_ADS` | `DISPLAY_ADS` | `LOCAL_INVENTORY_ADS` | `VEHICLE_INVENTORY_ADS` | `FREE_LISTINGS` | `FREE_LISTINGS_UCP_CHECKOUT` | `FREE_LOCAL_LISTINGS` | `FREE_LOCAL_VEHICLE_LISTINGS` | `YOUTUBE_AFFILIATE` | `YOUTUBE_SHOPPING` | `CLOUD_RETAIL` | `LOCAL_CLOUD_RETAIL` | `PRODUCT_REVIEWS` | `MERCHANT_REVIEWS` | `YOUTUBE_CHECKOUT`

**8. GmcDestinationStatus**
- `reportingContext: ReportingContextEnum`
- `approvedCountries: string[]` (ISO 3166-1 alpha-2)
- `pendingCountries: string[]`
- `disapprovedCountries: string[]`

**9. GmcItemLevelIssue**
- `code: string`
- `severity: 'SEVERITY_UNSPECIFIED' | 'NOT_IMPACTED' | 'DEMOTED' | 'DISAPPROVED'`
- `resolution: string`
- `attribute: string`
- `reportingContext: ReportingContextEnum`
- `description: string`
- `detail: string`
- `documentation: string`
- `applicableCountries: string[]`

### Token Storage Extension (`lib/tokens.ts`)

Extend `UserTokens` interface:
- `gmcAccounts: GmcAccount[]` — `{ merchantId, name, accessToken, refreshToken }`
- `oaiMerchantCenter?: { token: string, name?: string }`
- `productCampaignLinks: { productId: string, campaignIds: string[] }[]`

### Activity Types

New actions: `"product_copied"` and `"product_copied_with_campaign"`

## API Routes

### Google Merchant Center Auth

```
GET    /api/gmc/connect                     → OAuth redirect (scope: content)
GET    /api/gmc/callback                    → Token exchange + storage
GET    /api/gmc/accounts                    → List connected GMC accounts
DELETE /api/gmc/accounts/[id]/route.ts      → Disconnect a GMC account
```

### Product Data

```
GET  /api/gmc/products                      → List all products (all connected GMC accounts)
GET  /api/gmc/products/[id]/route.ts        → Single product detail (full 9 entities)
```

### Product-Campaign Links

```
GET  /api/gmc/products/[id]/campaigns       → Campaigns linked to a product
GET  /api/gads/campaigns/[id]/products      → Products linked to a campaign
```

### OpenAI Merchant Center

```
GET    /api/oai-mc/token                    → Check if OAI MC connected
POST   /api/oai-mc/token                    → Save/update OAI MC token
DELETE  /api/oai-mc/token                   → Remove OAI MC connection
POST   /api/oai-mc/copy                     → Copy product(s) to OAI Merchant Center
```

### Environment Variables

```
GOOGLE_MC_CLIENT_ID
GOOGLE_MC_CLIENT_SECRET
```

## Pages

### New Pages

| Route | Purpose |
|-------|---------|
| `/dashboard/products` | Product table with filters, search, "Copy to OAI" per row |
| `/dashboard/products/[id]` | Product detail — full attributes, linked campaigns |
| `/dashboard/products/copy/[productId]` | Split-pane copy flow (GMC → OAI MC) |

### Modified Pages

| Route | Change |
|-------|--------|
| `/dashboard/campaigns/[id]` | Add "Linked Products" section |
| `/dashboard/clone/[campaignId]` | Add product toggle checklist with select-all |
| `/dashboard/settings` | Add GMC + OAI Merchant Center sections |
| `/dashboard/page.tsx` | Add "Total Products" stat card |
| Sidebar (`app-sidebar.tsx`) | Add Products nav item between Campaigns and Settings |

## Components

### New Components

- **`ProductTable`** — Mirrors `CampaignTable`. Columns: image thumbnail, title, price, availability, brand, status indicator, linked campaigns count, "Copy to OAI" action button
- **`ProductDetail`** — Full product attributes display + linked campaigns cards with "View →" links
- **`ProductCopySplitPane`** — Mirrors `CloneSplitPane`. Left: GMC product (read-only). Right: OAI MC draft (editable). Field mapping indicators.
- **`ProductFilterBar`** — Mirrors `FilterBar`. Filters for availability, brand, product status
- **`ProductToggleList`** — Used in campaign clone flow. Checklist of linked products with individual toggles, image thumbnails, title, price. "Select All" / "Deselect All" at top
- **`GmcSettingsSection`** — GMC account table + "Connect Merchant Center" button. Mirrors Google Ads settings section
- **`OaiMcSettingsSection`** — OAI MC token management. Mirrors OAI Ads settings section

## Lib Modules

### New Modules

- **`lib/gmc/client.ts`** — GMC API client setup (Content API for Shopping v2.1)
- **`lib/gmc/products.ts`** — Fetch products from GMC (real + mock mode switch)
- **`lib/gmc/mock-data.ts`** — Mock products for dev mode (~15 products across accounts)
- **`lib/oai-mc/mapper.ts`** — Map GMC product → OAI MC format (assume similar structure for MVP)
- **`lib/types/gmc.ts`** — All type definitions (9 entities)

## Mock Data Strategy

~15 mock products distributed across existing mock accounts:

- **Acme Corp** (Shopping + PMax campaigns): 4-5 products (shoes, apparel)
- **Widget Inc** (Shopping campaign): 3-4 products (electronics, gadgets)
- **Greenleaf Dental** (Search + Display only): 0 products (services business, no product feed)
- **Nomad Roasters** (PMax campaign): 2-3 products (coffee beans, equipment)
- **Pinnacle Fitness** (Display + Search): 3 products (gym equipment, supplements)

Products include realistic attributes: placeholder image URLs, real-looking prices, brands, availability statuses, and some with item-level issues for testing status display.

### Product-Campaign Links

- Mock mode: hardcoded links mapping product IDs to campaign IDs
- Real mode: query Google Ads API for shopping/PMax campaigns and their product group criteria
- Links are read-only — they reflect the actual Google Ads ↔ GMC feed connection

## Product Copy Flow

### Standalone Copy (from Products table)

1. User clicks "Copy to OAI" on a product row
2. Routes to `/dashboard/products/copy/[productId]`
3. Split-pane view: GMC product (left, read-only) → OAI MC draft (right, editable)
4. Pre-filled from GMC data (assume near-identical structure for MVP)
5. Field mapping indicators (auto-mapped vs needs input)
6. "Create Draft" button → `POST /api/oai-mc/copy`
7. Logs activity: `product_copied`

### Copy with Campaign Clone (from clone flow)

1. User clones a campaign as usual
2. "Linked Products" section appears below split-pane (only if campaign has products)
3. `ProductToggleList`: each product with checkbox, image thumbnail, title, price
4. "Select All" / "Deselect All" at top
5. Toggled-on products are copied to OAI MC alongside the campaign draft
6. Single "Create Draft" button handles both campaign + selected products
7. Logs activity: `product_copied_with_campaign`

## Settings Page Layout

Four sections in order:

1. **Google Ads** — existing, no changes
2. **Google Merchant Center** — new, table of connected GMC accounts (merchant name, ID, status), "Connect Merchant Center" button, disconnect per account
3. **OpenAI Ads** — existing, no changes
4. **OpenAI Merchant Center** — new, token management (connect/disconnect), mirrors OAI Ads section

## Navigation

Sidebar order:
1. Dashboard
2. Campaigns
3. **Products** (new, Package icon from Lucide)
4. Settings (bottom)

## UI Standards

Per project conventions:
- All UI uses shadcn/ui components exclusively
- Every button: Lucide icon + pill shape (rounded-full)
- 8pt grid, smooth animations, backdrop blur on panels
- Desktop-only (no mobile optimization)
- One-click happy path philosophy for copy flows
