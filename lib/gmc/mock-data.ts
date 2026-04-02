// lib/gmc/mock-data.ts
// ~15 mock GMC products distributed across 4 merchant accounts with campaign links.

import type { GmcProduct, ProductCampaignLink } from "@/lib/types/gmc";

// ─────────────────────────────────────────────────────────────────────────────
// Merchant accounts:
//   Acme Corp Merchant    (MC-100200300) — shoes & apparel + Pinnacle Fitness
//   Widget Inc Merchant   (MC-400500600) — electronics + Nomad Roasters
// ─────────────────────────────────────────────────────────────────────────────

const COMMON = {
  contentLanguage: "en" as const,
  feedLabel: "US-EN" as const,
  dataSource: "api" as const,
  legacyLocal: false as const,
  customAttributes: [] as GmcProduct["customAttributes"],
  automatedDiscounts: {} as GmcProduct["automatedDiscounts"],
  versionNumber: "1",
};

function price(dollars: number): { amountMicros: string; currencyCode: string } {
  return { amountMicros: String(Math.round(dollars * 1_000_000)), currencyCode: "USD" };
}

function img(text: string): string {
  return `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(text)}`;
}

function baseStatus(
  created = "2026-01-15T00:00:00Z",
  updated = "2026-03-20T00:00:00Z",
  expires = "2026-07-01T00:00:00Z",
): GmcProduct["productStatus"] {
  return {
    destinationStatuses: [
      {
        reportingContext: "SHOPPING_ADS",
        approvedCountries: ["US"],
        pendingCountries: [],
        disapprovedCountries: [],
      },
    ],
    itemLevelIssues: [],
    creationDate: created,
    lastUpdateDate: updated,
    googleExpirationDate: expires,
  };
}

function makeProduct(
  offerId: string,
  accountId: string,
  accountName: string,
  attrs: Pick<
    GmcProduct["productAttributes"],
    "title" | "description" | "brand" | "price" | "availability" | "productTypes" | "imageLink"
  > & Partial<GmcProduct["productAttributes"]>,
  overrides?: Partial<GmcProduct>,
): GmcProduct {
  return {
    ...COMMON,
    name: `accounts/${accountId}/products/online:en:US-EN:${offerId}`,
    offerId,
    accountId,
    accountName,
    productAttributes: {
      link: `https://example.com/products/${offerId.toLowerCase()}`,
      additionalImageLinks: [],
      gtins: [],
      ...attrs,
    },
    productStatus: baseStatus(),
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Acme Corp Merchant (MC-100200300) — shoes & apparel
// ─────────────────────────────────────────────────────────────────────────────

const ACME_MERCHANT_ID = "MC-100200300";
const ACME_MERCHANT_NAME = "Acme Corp Merchant";

const acmeProducts: GmcProduct[] = [
  makeProduct(
    "RUN-001",
    ACME_MERCHANT_ID,
    ACME_MERCHANT_NAME,
    {
      title: "Running Shoes Pro",
      description: "High-performance running shoes with responsive foam cushioning and breathable mesh upper.",
      brand: "Acme Sport",
      price: price(129.99),
      availability: "IN_STOCK",
      productTypes: ["Apparel & Accessories", "Shoes", "Athletic Shoes"],
      imageLink: img("Running+Shoes+Pro"),
      color: "Black/White",
    },
  ),
  makeProduct(
    "TRL-002",
    ACME_MERCHANT_ID,
    ACME_MERCHANT_NAME,
    {
      title: "Trail Runners X",
      description: "Rugged trail running shoes with aggressive outsole grip and water-resistant construction.",
      brand: "Acme Sport",
      price: price(89.99),
      availability: "IN_STOCK",
      productTypes: ["Apparel & Accessories", "Shoes", "Athletic Shoes"],
      imageLink: img("Trail+Runners+X"),
      color: "Olive/Orange",
    },
  ),
  makeProduct(
    "BAG-003",
    ACME_MERCHANT_ID,
    ACME_MERCHANT_NAME,
    {
      title: "Gym Bag Deluxe",
      description: "Spacious gym bag with separate wet/dry compartments, shoe pocket, and padded laptop sleeve.",
      brand: "Acme Sport",
      price: price(49.99),
      availability: "LIMITED_AVAILABILITY",
      productTypes: ["Luggage & Bags", "Gym Bags"],
      imageLink: img("Gym+Bag+Deluxe"),
    },
  ),
  makeProduct(
    "JKT-004",
    ACME_MERCHANT_ID,
    ACME_MERCHANT_NAME,
    {
      title: "Winter Puffer Jacket",
      description: "Insulated puffer jacket with 650-fill down, windproof shell, and packable design.",
      brand: "Acme Apparel",
      price: price(199.99),
      availability: "IN_STOCK",
      productTypes: ["Apparel & Accessories", "Clothing", "Outerwear"],
      imageLink: img("Winter+Puffer+Jacket"),
      color: "Navy",
    },
  ),
  makeProduct(
    "SHR-005",
    ACME_MERCHANT_ID,
    ACME_MERCHANT_NAME,
    {
      title: "Performance Shorts",
      description: "Lightweight 5-inch running shorts with built-in brief, zip pocket, and reflective details.",
      brand: "Acme Sport",
      price: price(34.99),
      availability: "IN_STOCK",
      productTypes: ["Apparel & Accessories", "Clothing", "Athletic Shorts"],
      imageLink: img("Performance+Shorts"),
      color: "Heather Gray",
    },
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
// Widget Inc Merchant (MC-400500600) — electronics
// ─────────────────────────────────────────────────────────────────────────────

const WIDGET_MERCHANT_ID = "MC-400500600";
const WIDGET_MERCHANT_NAME = "Widget Inc Merchant";

const widgetProducts: GmcProduct[] = [
  makeProduct(
    "KB-W001",
    WIDGET_MERCHANT_ID,
    WIDGET_MERCHANT_NAME,
    {
      title: "Mechanical Keyboard MX",
      description: "Tenkeyless mechanical keyboard with Cherry MX switches, per-key RGB, and aluminum frame.",
      brand: "WidgetTech",
      price: price(149.99),
      availability: "IN_STOCK",
      productTypes: ["Electronics", "Computers", "Keyboards"],
      imageLink: img("Mechanical+Keyboard+MX"),
      color: "Space Gray",
    },
  ),
  makeProduct(
    "MS-W002",
    WIDGET_MERCHANT_ID,
    WIDGET_MERCHANT_NAME,
    {
      title: "Ergonomic Mouse Pro",
      description: "Vertical ergonomic mouse with 8 programmable buttons, 4000 DPI sensor, and wireless connectivity.",
      brand: "WidgetTech",
      price: price(79.99),
      availability: "IN_STOCK",
      productTypes: ["Electronics", "Computers", "Computer Mice"],
      imageLink: img("Ergonomic+Mouse+Pro"),
    },
  ),
  makeProduct(
    "MON-W003",
    WIDGET_MERCHANT_ID,
    WIDGET_MERCHANT_NAME,
    {
      title: '4K Monitor 27"',
      description: "27-inch 4K IPS display with 144Hz refresh rate, HDR400, and USB-C 90W power delivery.",
      brand: "WidgetTech",
      price: price(449.99),
      availability: "OUT_OF_STOCK",
      productTypes: ["Electronics", "Monitors"],
      imageLink: img("4K+Monitor+27in"),
    },
  ),
  makeProduct(
    "WC-W004",
    WIDGET_MERCHANT_ID,
    WIDGET_MERCHANT_NAME,
    {
      title: "HD Webcam Stream",
      description: "1080p 60fps webcam with auto-framing, built-in noise-canceling mic, and low-light correction.",
      brand: "WidgetTech",
      price: price(59.99),
      availability: "IN_STOCK",
      productTypes: ["Electronics", "Webcams"],
      imageLink: img("HD+Webcam+Stream"),
    },
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
// Pinnacle Fitness products — sold via Acme Corp Merchant
// ─────────────────────────────────────────────────────────────────────────────

const pinnacleProducts: GmcProduct[] = [
  makeProduct(
    "PINN-DB-001",
    ACME_MERCHANT_ID,
    ACME_MERCHANT_NAME,
    {
      title: "Adjustable Dumbbell Set",
      description: "Selectorized dumbbell pair adjusting from 5–52.5 lbs in 2.5 lb increments. Space-saving design.",
      brand: "Pinnacle Fitness",
      price: price(299.99),
      availability: "IN_STOCK",
      productTypes: ["Sporting Goods", "Exercise & Fitness", "Free Weights"],
      imageLink: img("Adjustable+Dumbbell+Set"),
    },
  ),
  makeProduct(
    "PINN-YM-002",
    ACME_MERCHANT_ID,
    ACME_MERCHANT_NAME,
    {
      title: "Premium Yoga Mat",
      description: "6mm thick non-slip natural rubber yoga mat with alignment lines, carrying strap included.",
      brand: "Pinnacle Fitness",
      price: price(39.99),
      availability: "IN_STOCK",
      productTypes: ["Sporting Goods", "Exercise & Fitness", "Yoga Mats"],
      imageLink: img("Premium+Yoga+Mat"),
      color: "Slate Blue",
    },
  ),
  makeProduct(
    "PINN-WP-003",
    ACME_MERCHANT_ID,
    ACME_MERCHANT_NAME,
    {
      title: "Whey Protein Isolate 5lb",
      description: "25g protein per serving, ultra-filtered whey isolate, less than 1g fat and sugar. Chocolate flavor.",
      brand: "Pinnacle Fitness",
      price: price(54.99),
      availability: "PREORDER",
      productTypes: ["Health & Beauty", "Sports Nutrition", "Protein Supplements"],
      imageLink: img("Whey+Protein+Isolate"),
      availabilityDate: "2026-05-01T00:00:00Z",
    },
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
// Nomad Roasters products — sold via Widget Inc Merchant
// ─────────────────────────────────────────────────────────────────────────────

const nomadProducts: GmcProduct[] = [
  makeProduct(
    "NR-ETH-001",
    WIDGET_MERCHANT_ID,
    WIDGET_MERCHANT_NAME,
    {
      title: "Single Origin Ethiopia Beans",
      description: "Light roast whole bean coffee. Tasting notes of blueberry, jasmine, and citrus. 12oz bag.",
      brand: "Nomad Roasters",
      price: price(18.99),
      availability: "IN_STOCK",
      productTypes: ["Food, Beverages & Tobacco", "Beverages", "Coffee"],
      imageLink: img("Ethiopia+Coffee+Beans"),
    },
  ),
  makeProduct(
    "NR-GR-002",
    WIDGET_MERCHANT_ID,
    WIDGET_MERCHANT_NAME,
    {
      title: "Burr Coffee Grinder",
      description: "40mm conical burr grinder with 18 grind settings, 200g hopper, and single-dose capability.",
      brand: "Nomad Roasters",
      price: price(89.99),
      availability: "IN_STOCK",
      productTypes: ["Kitchen & Dining", "Coffee & Espresso", "Coffee Grinders"],
      imageLink: img("Burr+Coffee+Grinder"),
      color: "Matte Black",
    },
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
// Product with issues — Wireless Earbuds Budget
// ─────────────────────────────────────────────────────────────────────────────

const problematicProduct: GmcProduct = makeProduct(
  "EAR-BUDGET-001",
  WIDGET_MERCHANT_ID,
  WIDGET_MERCHANT_NAME,
  {
    title: "Wireless Earbuds Budget",
    description: "True wireless earbuds with 20hr total battery life, IPX4 water resistance, and touch controls.",
    brand: "WidgetTech",
    price: price(19.99),
    availability: "IN_STOCK",
    productTypes: ["Electronics", "Headphones", "Wireless Earbuds"],
    imageLink: img("Wireless+Earbuds+Budget"),
  },
  {
    productStatus: {
      destinationStatuses: [
        {
          reportingContext: "SHOPPING_ADS",
          approvedCountries: [],
          pendingCountries: [],
          disapprovedCountries: ["US"],
        },
      ],
      itemLevelIssues: [
        {
          code: "missing_gtin",
          severity: "DEMOTED",
          resolution: "merchant_action",
          attribute: "gtin",
          reportingContext: "SHOPPING_ADS",
          description: "Missing GTIN",
          detail: "This product is missing a GTIN. Add a valid GTIN to improve product visibility.",
          documentation: "https://support.google.com/merchants/answer/160161",
          applicableCountries: ["US"],
        },
        {
          code: "image_too_small",
          severity: "NOT_IMPACTED",
          resolution: "merchant_action",
          attribute: "image_link",
          reportingContext: "SHOPPING_ADS",
          description: "Image too small",
          detail: "The main product image does not meet the minimum size requirements.",
          documentation: "https://support.google.com/merchants/answer/6324350",
          applicableCountries: ["US"],
        },
      ],
      creationDate: "2026-01-15T00:00:00Z",
      lastUpdateDate: "2026-03-20T00:00:00Z",
      googleExpirationDate: "2026-07-01T00:00:00Z",
    },
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: GmcProduct[] = [
  ...acmeProducts,
  ...widgetProducts,
  ...pinnacleProducts,
  ...nomadProducts,
  problematicProduct,
];

// Campaign IDs (from lib/gads/mock-data.ts):
//   "6715028394" = Acme Corp "Holiday Shopping 2026" (SHOPPING)
//   "9451637280" = Acme Corp "Performance Max - All Products" (PERFORMANCE_MAX)

export const MOCK_PRODUCT_CAMPAIGN_LINKS: ProductCampaignLink[] = [
  // RUN-001: Shopping + PMax
  { productId: "RUN-001", campaignIds: ["6715028394", "9451637280"] },
  // TRL-002: Shopping + PMax
  { productId: "TRL-002", campaignIds: ["6715028394", "9451637280"] },
  // BAG-003: Shopping only
  { productId: "BAG-003", campaignIds: ["6715028394"] },
  // JKT-004: PMax only
  { productId: "JKT-004", campaignIds: ["9451637280"] },
  // SHR-005: Shopping + PMax
  { productId: "SHR-005", campaignIds: ["6715028394", "9451637280"] },
  // Widget Inc electronics — no campaign links
  { productId: "KB-W001", campaignIds: [] },
  { productId: "MS-W002", campaignIds: [] },
  { productId: "MON-W003", campaignIds: [] },
  { productId: "WC-W004", campaignIds: [] },
  // Pinnacle Fitness — PINN-DB-001 links to PMax
  { productId: "PINN-DB-001", campaignIds: ["9451637280"] },
  { productId: "PINN-YM-002", campaignIds: [] },
  { productId: "PINN-WP-003", campaignIds: [] },
  // Nomad Roasters — no campaign links
  { productId: "NR-ETH-001", campaignIds: [] },
  { productId: "NR-GR-002", campaignIds: [] },
  // Problematic product — no campaign links
  { productId: "EAR-BUDGET-001", campaignIds: [] },
];
