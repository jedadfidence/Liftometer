# Liftometer MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an MVP web app that lets advertisers sign in with Google, connect Google Ads accounts, browse campaigns, and clone them as OpenAI (ChatGPT) Ads drafts via a stubbed API.

**Architecture:** Next.js 16 App Router with Auth.js for Google SSO, separate GAds OAuth for API access, in-memory token storage, shadcn/ui component system, and a stubbed OAI API module. No database. All state lives in encrypted cookies (session) and server-side memory (tokens).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Auth.js v5, google-ads-api, next-themes, Vitest, Vercel

**Spec:** `docs/superpowers/specs/2026-03-27-liftometer-mvp-design.md`

---

## Task 1: Project Scaffold & Design System

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json` (via create-next-app)
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `components/ui/` (via shadcn init)
- Create: `lib/utils.ts` (via shadcn init)
- Create: `.env.local`
- Create: `.gitignore`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/jed/Documents
npx create-next-app@latest Liftometer --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

Note: The project directory already exists with `docs/` and `.git/`. Run from parent directory and let it merge. If it conflicts, create in a temp dir and move files.

- [ ] **Step 2: Initialize shadcn/ui**

```bash
cd /Users/jed/Documents/Liftometer
npx shadcn@latest init -d --base radix
```

After init, fix the Geist font issue in `globals.css` — replace any `--font-sans: var(--font-sans)` with literal font names:

```css
--font-sans: "Geist", "Geist Fallback", ui-sans-serif, system-ui, sans-serif;
--font-mono: "Geist Mono", "Geist Mono Fallback", ui-monospace, monospace;
```

Move font variable classNames from `<body>` to `<html>` in `layout.tsx`.

- [ ] **Step 3: Add app-specific CSS tokens to `globals.css`**

Add inside the `@theme inline` block:

```css
/* App-specific semantic tokens */
--color-status-enabled: oklch(0.723 0.219 149.579);
--color-status-paused: oklch(0.795 0.184 86.047);
--color-status-draft: oklch(0.708 0 0);
--color-status-removed: oklch(0.637 0.237 15.163);
--color-mapped: oklch(0.723 0.219 149.579);
--color-action-needed: oklch(0.795 0.184 86.047);
```

- [ ] **Step 4: Install shadcn components**

```bash
npx shadcn@latest add button card badge table input select tabs dialog alert-dialog sheet separator skeleton tooltip dropdown-menu switch scroll-area popover label
```

- [ ] **Step 5: Install additional dependencies**

```bash
npm install next-themes lucide-react
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 6: Create vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

Create `vitest.setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 7: Create `.env.local` with placeholders**

```env
# Auth.js
AUTH_SECRET=placeholder-secret-change-me
AUTH_GOOGLE_ID=placeholder-google-client-id
AUTH_GOOGLE_SECRET=placeholder-google-client-secret

# Google Ads API
GOOGLE_ADS_CLIENT_ID=placeholder-gads-client-id
GOOGLE_ADS_CLIENT_SECRET=placeholder-gads-client-secret
GOOGLE_ADS_DEVELOPER_TOKEN=placeholder-developer-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Add `.env*.local` to `.gitignore` if not already there.

- [ ] **Step 8: Set up theme provider and root layout**

Install next-themes and set up `app/layout.tsx` with:
- `ThemeProvider` from next-themes (attribute="class", defaultTheme="dark")
- `TooltipProvider` from shadcn
- Geist font loading via `next/font/google`
- Metadata: title "Liftometer", description "Clone your Google Ads campaigns to OpenAI"

- [ ] **Step 9: Create a placeholder landing page**

`app/page.tsx` — simple centered card with "Liftometer" title and "Coming soon" text. Verify the app runs:

```bash
npm run dev
```

Open http://localhost:3000 and confirm: dark theme, Geist font, card renders.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with shadcn/ui and design system tokens"
```

---

## Task 2: Shared Types & Utilities

**Files:**
- Create: `lib/types/gads.ts`
- Create: `lib/types/oai.ts`
- Create: `lib/types/index.ts`
- Create: `lib/utils.ts` (extend shadcn's cn utility)
- Test: `lib/__tests__/utils.test.ts`

- [ ] **Step 1: Write tests for utility functions**

Create `lib/__tests__/utils.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { microsToUsd, usdToMicros, truncate, formatBudget } from "@/lib/utils";

describe("microsToUsd", () => {
  it("converts micros to USD", () => {
    expect(microsToUsd(5000000)).toBe(5);
    expect(microsToUsd(1500000)).toBe(1.5);
    expect(microsToUsd(0)).toBe(0);
  });

  it("handles undefined", () => {
    expect(microsToUsd(undefined)).toBe(0);
  });
});

describe("usdToMicros", () => {
  it("converts USD to micros", () => {
    expect(usdToMicros(5)).toBe(5000000);
    expect(usdToMicros(1.5)).toBe(1500000);
  });
});

describe("truncate", () => {
  it("truncates string to max length", () => {
    expect(truncate("Hello World", 5)).toBe("Hello");
    expect(truncate("Short", 10)).toBe("Short");
    expect(truncate("", 5)).toBe("");
  });
});

describe("formatBudget", () => {
  it("formats number as USD currency", () => {
    expect(formatBudget(1234.56)).toBe("$1,234.56");
    expect(formatBudget(0)).toBe("$0.00");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- lib/__tests__/utils.test.ts
```

Expected: FAIL — functions not defined.

- [ ] **Step 3: Implement utility functions**

Extend `lib/utils.ts` (which already has `cn` from shadcn):

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function microsToUsd(micros: number | undefined): number {
  if (micros === undefined) return 0;
  return micros / 1_000_000;
}

export function usdToMicros(usd: number): number {
  return usd * 1_000_000;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength);
}

export function formatBudget(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- lib/__tests__/utils.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Create GAds types**

Create `lib/types/gads.ts`:

```typescript
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
```

- [ ] **Step 6: Create OAI types**

Create `lib/types/oai.ts`:

```typescript
export type OAIObjective =
  | "AWARENESS"
  | "CONSIDERATION"
  | "TRAFFIC"
  | "CONVERSIONS"
  | "ENGAGEMENT";

export type OAIBiddingStrategy = "CPM" | "TARGET_CPA" | "MAXIMIZE_CONVERSIONS";

export type OAIDevice = "MOBILE" | "DESKTOP";

export type OAIConversationDepth = "ANY" | "EARLY" | "DEEP";

export type OAIAttributionWindow = "1_DAY" | "7_DAY" | "28_DAY";

export type OAIAttributionModel =
  | "LAST_CLICK"
  | "POSITION_BASED"
  | "TIME_DECAY";

export type OAICreativeFormat =
  | "SPONSORED_CARD"
  | "PRODUCT_SPOTLIGHT"
  | "CONTEXTUAL_SIDEBAR";

export interface OAICampaignDraft {
  name: string;
  objective: OAIObjective;
  status: "DRAFT";
  budget: {
    daily_amount: number;
    total_amount?: number;
  };
  schedule: {
    start_date: string;
    end_date?: string;
  };
  ad_sets: OAIAdSet[];
}

export interface OAIAdSet {
  name: string;
  status: "DRAFT";
  bidding: {
    strategy: OAIBiddingStrategy;
    cpm_amount?: number;
    target_cpa?: number;
  };
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
```

- [ ] **Step 7: Create barrel export**

Create `lib/types/index.ts`:

```typescript
export * from "./gads";
export * from "./oai";
```

- [ ] **Step 8: Commit**

```bash
git add lib/types lib/__tests__/utils.test.ts lib/utils.ts vitest.config.ts vitest.setup.ts
git commit -m "feat: add shared types (GAds, OAI) and utility functions with tests"
```

---

## Task 3: OAI Stub API & Mapper

**Files:**
- Create: `lib/oai/stub.ts`
- Create: `lib/oai/mapper.ts`
- Test: `lib/oai/__tests__/stub.test.ts`
- Test: `lib/oai/__tests__/mapper.test.ts`

- [ ] **Step 1: Write mapper tests**

Create `lib/oai/__tests__/mapper.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  mapCampaign,
  mapAdGroup,
  mapAd,
  mapObjective,
  mapFullCampaign,
  countMappingResults,
} from "@/lib/oai/mapper";
import type { GadsCampaign, GadsAdGroup, GadsAd } from "@/lib/types";

const mockCampaign: GadsCampaign = {
  id: "123",
  name: "Summer Sale 2026",
  status: "ENABLED",
  advertisingChannelType: "SEARCH",
  biddingStrategyType: "TARGET_CPA",
  budget: {
    amountMicros: 50_000_000,
    totalAmountMicros: undefined,
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
  accountId: "456",
  accountName: "Test Account",
};

const mockAdGroup: GadsAdGroup = {
  id: "789",
  campaignId: "123",
  name: "Brand Keywords",
  status: "ENABLED",
  type: "SEARCH_STANDARD",
  cpcBidMicros: 2_000_000,
  targetCpaMicros: 10_000_000,
};

const mockAd: GadsAd = {
  id: "101",
  adGroupId: "789",
  type: "RESPONSIVE_SEARCH_AD",
  headlines: ["Summer Deals", "Shop Now", "Best Prices"],
  descriptions: ["Get the best summer deals on all products.", "Free shipping on orders over $50."],
  finalUrls: ["https://example.com/summer"],
};

describe("mapObjective", () => {
  it("maps TARGET_CPA to CONVERSIONS", () => {
    expect(mapObjective("TARGET_CPA")).toBe("CONVERSIONS");
  });
  it("maps MAXIMIZE_CONVERSIONS to CONVERSIONS", () => {
    expect(mapObjective("MAXIMIZE_CONVERSIONS")).toBe("CONVERSIONS");
  });
  it("maps TARGET_ROAS to CONVERSIONS", () => {
    expect(mapObjective("TARGET_ROAS")).toBe("CONVERSIONS");
  });
  it("maps MAXIMIZE_CONVERSION_VALUE to CONVERSIONS", () => {
    expect(mapObjective("MAXIMIZE_CONVERSION_VALUE")).toBe("CONVERSIONS");
  });
  it("maps TARGET_IMPRESSION_SHARE to AWARENESS", () => {
    expect(mapObjective("TARGET_IMPRESSION_SHARE")).toBe("AWARENESS");
  });
  it("maps MANUAL_CPC to TRAFFIC", () => {
    expect(mapObjective("MANUAL_CPC")).toBe("TRAFFIC");
  });
  it("maps TARGET_SPEND to TRAFFIC", () => {
    expect(mapObjective("TARGET_SPEND")).toBe("TRAFFIC");
  });
  it("maps MANUAL_CPM to AWARENESS", () => {
    expect(mapObjective("MANUAL_CPM")).toBe("AWARENESS");
  });
  it("maps MANUAL_CPV to CONSIDERATION", () => {
    expect(mapObjective("MANUAL_CPV")).toBe("CONSIDERATION");
  });
  it("maps unknown to TRAFFIC as default", () => {
    expect(mapObjective("UNKNOWN_STRATEGY")).toBe("TRAFFIC");
  });
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
    const adGroup: GadsAdGroup = {
      ...mockAdGroup,
      targetCpaMicros: undefined,
      cpcBidMicros: 1_000_000,
    };
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
    const longAd: GadsAd = {
      ...mockAd,
      headlines: ["A".repeat(100)],
    };
    const result = mapAd(longAd);
    expect(result.headline.length).toBe(60);
  });

  it("truncates description to 180 chars", () => {
    const longAd: GadsAd = {
      ...mockAd,
      descriptions: ["B".repeat(200)],
    };
    const result = mapAd(longAd);
    expect(result.description.length).toBe(180);
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- lib/oai/__tests__/mapper.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement mapper**

Create `lib/oai/mapper.ts`:

```typescript
import type {
  GadsCampaign,
  GadsAdGroup,
  GadsAd,
  OAICampaignDraft,
  OAIAdSet,
  OAICreative,
  OAIObjective,
  OAIBiddingStrategy,
} from "@/lib/types";
import { microsToUsd, truncate } from "@/lib/utils";

const OBJECTIVE_MAP: Record<string, OAIObjective> = {
  MAXIMIZE_CONVERSIONS: "CONVERSIONS",
  TARGET_CPA: "CONVERSIONS",
  MAXIMIZE_CONVERSION_VALUE: "CONVERSIONS",
  TARGET_ROAS: "CONVERSIONS",
  TARGET_IMPRESSION_SHARE: "AWARENESS",
  MANUAL_CPC: "TRAFFIC",
  TARGET_SPEND: "TRAFFIC",
  MANUAL_CPM: "AWARENESS",
  MANUAL_CPV: "CONSIDERATION",
};

export function mapObjective(biddingStrategyType: string): OAIObjective {
  return OBJECTIVE_MAP[biddingStrategyType] ?? "TRAFFIC";
}

export function mapCampaign(
  campaign: GadsCampaign
): Omit<OAICampaignDraft, "ad_sets"> {
  return {
    name: campaign.name,
    objective: mapObjective(campaign.biddingStrategyType),
    status: "DRAFT",
    budget: {
      daily_amount: microsToUsd(campaign.budget.amountMicros),
      total_amount: campaign.budget.totalAmountMicros
        ? microsToUsd(campaign.budget.totalAmountMicros)
        : undefined,
    },
    schedule: {
      start_date: campaign.startDate ?? new Date().toISOString().split("T")[0],
      end_date: campaign.endDate,
    },
  };
}

export function mapAdGroup(adGroup: GadsAdGroup): Omit<OAIAdSet, "creatives"> {
  const hasTargetCpa =
    adGroup.targetCpaMicros !== undefined && adGroup.targetCpaMicros > 0;
  const strategy: OAIBiddingStrategy = hasTargetCpa ? "TARGET_CPA" : "CPM";

  return {
    name: adGroup.name,
    status: "DRAFT",
    bidding: {
      strategy,
      cpm_amount: strategy === "CPM" ? 60 : undefined,
      target_cpa: hasTargetCpa
        ? microsToUsd(adGroup.targetCpaMicros)
        : undefined,
    },
    targeting: {
      topic_clusters: [],
      intent_signals: [],
      locations: [],
      languages: [],
      devices: ["MOBILE", "DESKTOP"],
      conversation_depth: "ANY",
    },
    attribution: {
      click_window: "7_DAY",
      view_window: "1_DAY",
      model: "LAST_CLICK",
    },
  };
}

export function mapAd(ad: GadsAd): OAICreative {
  return {
    headline: truncate(ad.headlines[0] ?? "", 60),
    description: truncate(ad.descriptions[0] ?? "", 180),
    destination_url: ad.finalUrls[0] ?? "",
    format: "SPONSORED_CARD",
  };
}

export function mapFullCampaign(
  campaign: GadsCampaign,
  adGroups: GadsAdGroup[],
  adsByAdGroup: Record<string, GadsAd[]>
): OAICampaignDraft {
  const mapped = mapCampaign(campaign);
  const adSets: OAIAdSet[] = adGroups.map((ag) => {
    const adSetBase = mapAdGroup(ag);
    const ads = adsByAdGroup[ag.id] ?? [];
    return {
      ...adSetBase,
      creatives: ads.map(mapAd),
    };
  });

  return {
    ...mapped,
    ad_sets: adSets,
  };
}

export function countMappingResults(draft: OAICampaignDraft): {
  mapped: number;
  actionNeeded: number;
} {
  let mapped = 0;
  let actionNeeded = 0;

  // Campaign level — all fields are auto-mapped
  mapped += 5; // name, objective, budget.daily, start_date, status

  if (draft.budget.total_amount) mapped++;
  if (draft.schedule.end_date) mapped++;

  for (const adSet of draft.ad_sets) {
    mapped += 7; // name, status, bidding.strategy, devices, conversation_depth, click_window, view_window, model
    actionNeeded += 2; // topic_clusters, intent_signals always need input

    if (adSet.bidding.cpm_amount) mapped++;
    if (adSet.bidding.target_cpa) mapped++;
    if (adSet.targeting.locations.length > 0) mapped++;
    else actionNeeded++;
    if (adSet.targeting.languages.length > 0) mapped++;
    else actionNeeded++;

    for (const creative of adSet.creatives) {
      if (creative.destination_url) mapped++;
      mapped++; // format
      if (creative.headline) mapped++;
      else actionNeeded++;
      if (creative.description) mapped++;
      else actionNeeded++;
    }
  }

  return { mapped, actionNeeded };
}
```

- [ ] **Step 4: Run mapper tests**

```bash
npm run test:run -- lib/oai/__tests__/mapper.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Write stub tests**

Create `lib/oai/__tests__/stub.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { createOAIDraft } from "@/lib/oai/stub";
import type { OAICampaignDraft } from "@/lib/types";

const mockDraft: OAICampaignDraft = {
  name: "Test Campaign",
  objective: "CONVERSIONS",
  status: "DRAFT",
  budget: { daily_amount: 50 },
  schedule: { start_date: "2026-06-01" },
  ad_sets: [
    {
      name: "Ad Set 1",
      status: "DRAFT",
      bidding: { strategy: "CPM", cpm_amount: 60 },
      targeting: {
        topic_clusters: [],
        intent_signals: [],
        locations: ["US"],
        languages: ["en"],
        devices: ["MOBILE", "DESKTOP"],
        conversation_depth: "ANY",
      },
      attribution: {
        click_window: "7_DAY",
        view_window: "1_DAY",
        model: "LAST_CLICK",
      },
      creatives: [
        {
          headline: "Test Headline",
          description: "Test Description",
          destination_url: "https://example.com",
          format: "SPONSORED_CARD",
        },
      ],
    },
  ],
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
      ad_sets: [
        {
          ...mockDraft.ad_sets[0],
          targeting: {
            ...mockDraft.ad_sets[0].targeting,
            topic_clusters: ["shopping"],
            intent_signals: ["purchase"],
          },
        },
      ],
    };
    const result = await createOAIDraft(filledDraft);
    const topicWarnings = result.warnings.filter((w) =>
      w.includes("Topic clusters")
    );
    expect(topicWarnings).toHaveLength(0);
  });
});
```

- [ ] **Step 6: Run stub tests to verify they fail**

```bash
npm run test:run -- lib/oai/__tests__/stub.test.ts
```

Expected: FAIL.

- [ ] **Step 7: Implement stub**

Create `lib/oai/stub.ts`:

```typescript
import type { OAICampaignDraft, OAICloneResponse } from "@/lib/types";

export async function createOAIDraft(
  draft: OAICampaignDraft
): Promise<OAICloneResponse> {
  // Simulate API delay (1-2 seconds)
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 1000)
  );

  const warnings: string[] = [];

  for (const adSet of draft.ad_sets) {
    if (adSet.targeting.topic_clusters.length === 0) {
      warnings.push(`Topic clusters not set for Ad Set "${adSet.name}"`);
    }
    if (adSet.targeting.intent_signals.length === 0) {
      warnings.push(`Intent signals not set for Ad Set "${adSet.name}"`);
    }
    for (const creative of adSet.creatives) {
      if (!creative.headline) {
        warnings.push(`Headline missing for a creative in Ad Set "${adSet.name}"`);
      }
      if (!creative.description) {
        warnings.push(`Description missing for a creative in Ad Set "${adSet.name}"`);
      }
    }
  }

  const totalCreatives = draft.ad_sets.reduce(
    (sum, as) => sum + as.creatives.length,
    0
  );

  return {
    draft_id: crypto.randomUUID(),
    campaign_name: draft.name,
    status: "DRAFT",
    created_at: new Date().toISOString(),
    ad_sets_count: draft.ad_sets.length,
    creatives_count: totalCreatives,
    warnings,
  };
}
```

- [ ] **Step 8: Run all stub tests**

```bash
npm run test:run -- lib/oai/__tests__/stub.test.ts
```

Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add lib/oai
git commit -m "feat: add GAds→OAI mapper and stub API with tests"
```

---

## Task 4: In-Memory Token Store

**Files:**
- Create: `lib/tokens.ts`
- Test: `lib/__tests__/tokens.test.ts`

- [ ] **Step 1: Write token store tests**

Create `lib/__tests__/tokens.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import {
  addGadsAccount,
  getGadsAccounts,
  removeGadsAccount,
  getOaiToken,
  setOaiToken,
  clearUserTokens,
} from "@/lib/tokens";

describe("token store", () => {
  beforeEach(() => {
    clearUserTokens("user-1");
  });

  it("stores and retrieves GAds accounts", () => {
    addGadsAccount("user-1", {
      customerId: "123-456-7890",
      name: "Test Account",
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
    const accounts = getGadsAccounts("user-1");
    expect(accounts).toHaveLength(1);
    expect(accounts[0].customerId).toBe("123-456-7890");
  });

  it("supports multiple GAds accounts per user", () => {
    addGadsAccount("user-1", {
      customerId: "111",
      name: "Account A",
      accessToken: "a",
      refreshToken: "a",
    });
    addGadsAccount("user-1", {
      customerId: "222",
      name: "Account B",
      accessToken: "b",
      refreshToken: "b",
    });
    expect(getGadsAccounts("user-1")).toHaveLength(2);
  });

  it("removes a GAds account", () => {
    addGadsAccount("user-1", {
      customerId: "111",
      name: "Account A",
      accessToken: "a",
      refreshToken: "a",
    });
    removeGadsAccount("user-1", "111");
    expect(getGadsAccounts("user-1")).toHaveLength(0);
  });

  it("returns empty array for unknown user", () => {
    expect(getGadsAccounts("unknown")).toEqual([]);
  });

  it("stores and retrieves OAI token", () => {
    setOaiToken("user-1", "oai-token-123");
    expect(getOaiToken("user-1")).toBe("oai-token-123");
  });

  it("returns undefined OAI token for unknown user", () => {
    expect(getOaiToken("unknown")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- lib/__tests__/tokens.test.ts
```

- [ ] **Step 3: Implement token store**

Create `lib/tokens.ts`:

```typescript
import type { GadsAccount } from "@/lib/types";

interface UserTokens {
  gadsAccounts: GadsAccount[];
  oaiToken?: string;
}

const store = new Map<string, UserTokens>();

function getOrCreate(userId: string): UserTokens {
  if (!store.has(userId)) {
    store.set(userId, { gadsAccounts: [] });
  }
  return store.get(userId)!;
}

export function addGadsAccount(userId: string, account: GadsAccount): void {
  const tokens = getOrCreate(userId);
  const existing = tokens.gadsAccounts.findIndex(
    (a) => a.customerId === account.customerId
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
  customerId: string
): void {
  const tokens = store.get(userId);
  if (!tokens) return;
  tokens.gadsAccounts = tokens.gadsAccounts.filter(
    (a) => a.customerId !== customerId
  );
}

export function setOaiToken(userId: string, token: string): void {
  const tokens = getOrCreate(userId);
  tokens.oaiToken = token;
}

export function getOaiToken(userId: string): string | undefined {
  return store.get(userId)?.oaiToken;
}

export function clearUserTokens(userId: string): void {
  store.delete(userId);
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test:run -- lib/__tests__/tokens.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/tokens.ts lib/__tests__/tokens.test.ts
git commit -m "feat: add in-memory token store with tests"
```

---

## Task 5: Auth.js Setup (Google SSO)

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `app/sign-in/page.tsx`
- Modify: `app/layout.tsx` (add SessionProvider)
- Create: `components/auth-guard.tsx`

- [ ] **Step 1: Install Auth.js**

```bash
npm install next-auth@beta
```

Check the Auth.js Next.js docs via context7 for the latest v5 API before proceeding: https://authjs.dev/getting-started/installation?framework=next.js

- [ ] **Step 2: Create Auth.js config**

Create `lib/auth.ts`:

```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account) {
        token.id = profile?.sub;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

Note: Verify exact Auth.js v5 API via docs before implementing. The `auth` export is used as middleware-style session getter.

- [ ] **Step 3: Create route handler**

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 4: Create sign-in page**

Create `app/sign-in/page.tsx`:

```tsx
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Liftometer</CardTitle>
          <CardDescription>
            Clone your Google Ads campaigns to OpenAI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              Sign in with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 5: Create auth guard component**

Create `components/auth-guard.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return <>{children}</>;
}
```

- [ ] **Step 6: Update landing page**

Update `app/page.tsx` to redirect authenticated users to `/dashboard` and show sign-in for unauthenticated:

```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Liftometer</CardTitle>
          <CardDescription>
            Clone your Google Ads campaigns to OpenAI
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/sign-in">Get Started</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: Verify auth flow works locally**

```bash
npm run dev
```

Visit http://localhost:3000. Confirm: landing page renders, "Get Started" links to `/sign-in`, sign-in page shows Google button. (Google OAuth won't work with placeholder creds, but the pages should render.)

- [ ] **Step 8: Commit**

```bash
git add lib/auth.ts app/api/auth app/sign-in components/auth-guard.tsx app/page.tsx
git commit -m "feat: add Auth.js Google SSO with sign-in page and auth guard"
```

---

## Task 6: Custom App Components (Design System)

**Files:**
- Create: `components/nav-bar.tsx`
- Create: `components/theme-toggle.tsx`
- Create: `components/status-badge.tsx`
- Create: `components/account-card.tsx`
- Create: `components/level-toggle.tsx`
- Create: `components/mapping-field.tsx`
- Create: `components/mapping-section.tsx`
- Create: `components/stats-bar.tsx`
- Create: `components/progress-steps.tsx`
- Create: `components/empty-state.tsx`
- Create: `components/error-state.tsx`
- Test: `components/__tests__/status-badge.test.tsx`
- Test: `components/__tests__/mapping-field.test.tsx`

- [ ] **Step 1: Write StatusBadge tests**

Create `components/__tests__/status-badge.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/status-badge";

describe("StatusBadge", () => {
  it("renders ENABLED status", () => {
    render(<StatusBadge status="ENABLED" />);
    expect(screen.getByText("Enabled")).toBeDefined();
  });

  it("renders PAUSED status", () => {
    render(<StatusBadge status="PAUSED" />);
    expect(screen.getByText("Paused")).toBeDefined();
  });

  it("renders DRAFT status", () => {
    render(<StatusBadge status="DRAFT" />);
    expect(screen.getByText("Draft")).toBeDefined();
  });

  it("renders REMOVED status", () => {
    render(<StatusBadge status="REMOVED" />);
    expect(screen.getByText("Removed")).toBeDefined();
  });
});
```

- [ ] **Step 2: Write MappingField tests**

Create `components/__tests__/mapping-field.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MappingField } from "@/components/mapping-field";

describe("MappingField", () => {
  it("renders label and source value", () => {
    render(
      <MappingField
        label="Campaign Name"
        sourceValue="Summer Sale"
        mappedValue="Summer Sale"
        onMappedValueChange={() => {}}
        status="mapped"
      />
    );
    expect(screen.getByText("Campaign Name")).toBeDefined();
    expect(screen.getByText("Summer Sale")).toBeDefined();
  });

  it("shows Mapped badge when status is mapped", () => {
    render(
      <MappingField
        label="Name"
        sourceValue="Test"
        mappedValue="Test"
        onMappedValueChange={() => {}}
        status="mapped"
      />
    );
    expect(screen.getByText("Mapped")).toBeDefined();
  });

  it("shows Action needed badge when status is action-needed", () => {
    render(
      <MappingField
        label="Topic Clusters"
        sourceValue="N/A"
        mappedValue=""
        onMappedValueChange={() => {}}
        status="action-needed"
      />
    );
    expect(screen.getByText("Action needed")).toBeDefined();
  });

  it("calls onMappedValueChange when input changes", () => {
    const onChange = vi.fn();
    render(
      <MappingField
        label="Name"
        sourceValue="Test"
        mappedValue="Test"
        onMappedValueChange={onChange}
        status="mapped"
      />
    );
    const input = screen.getByDisplayValue("Test");
    fireEvent.change(input, { target: { value: "New Value" } });
    expect(onChange).toHaveBeenCalledWith("New Value");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm run test:run -- components/__tests__
```

- [ ] **Step 4: Implement all custom components**

Create each component file. Key implementations:

**`components/status-badge.tsx`:**

```tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ENABLED: { label: "Enabled", className: "bg-[var(--color-status-enabled)] text-white" },
  PAUSED: { label: "Paused", className: "bg-[var(--color-status-paused)] text-black" },
  DRAFT: { label: "Draft", className: "bg-[var(--color-status-draft)] text-white" },
  REMOVED: { label: "Removed", className: "bg-[var(--color-status-removed)] text-white" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "" };
  return <Badge className={cn(config.className)}>{config.label}</Badge>;
}
```

**`components/theme-toggle.tsx`:**

```tsx
"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**`components/mapping-field.tsx`:**

```tsx
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MappingFieldProps {
  label: string;
  sourceValue: string;
  mappedValue: string;
  onMappedValueChange: (value: string) => void;
  status: "mapped" | "action-needed";
  editable?: boolean;
  maxLength?: number;
}

export function MappingField({
  label,
  sourceValue,
  mappedValue,
  onMappedValueChange,
  status,
  editable = true,
  maxLength,
}: MappingFieldProps) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-1/4 text-sm text-muted-foreground">{label}</div>
      <div className="w-1/4 text-sm font-mono">{sourceValue}</div>
      <div className="w-1/4">
        {editable ? (
          <Input
            value={mappedValue}
            onChange={(e) => onMappedValueChange(e.target.value)}
            maxLength={maxLength}
            className={cn(
              "text-sm",
              status === "action-needed" && !mappedValue && "border-[var(--color-action-needed)]"
            )}
          />
        ) : (
          <span className="text-sm font-mono">{mappedValue}</span>
        )}
      </div>
      <div className="w-1/4 flex justify-end">
        <Badge
          className={cn(
            status === "mapped"
              ? "bg-[var(--color-mapped)] text-white"
              : "bg-[var(--color-action-needed)] text-black"
          )}
        >
          {status === "mapped" ? "Mapped" : "Action needed"}
        </Badge>
      </div>
    </div>
  );
}
```

Implement the remaining components (`nav-bar.tsx`, `account-card.tsx`, `level-toggle.tsx`, `mapping-section.tsx`, `stats-bar.tsx`, `progress-steps.tsx`, `empty-state.tsx`, `error-state.tsx`) following the same patterns — composing shadcn primitives, using design tokens, handling loading/empty/error states.

- [ ] **Step 5: Run component tests**

```bash
npm run test:run -- components/__tests__
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add components/
git commit -m "feat: add custom app components (StatusBadge, MappingField, NavBar, etc.)"
```

---

## Task 7: Dashboard Layout & Connected Accounts

**Files:**
- Create: `app/dashboard/layout.tsx`
- Create: `app/dashboard/page.tsx`
- Create: `app/api/gads/connect/route.ts`
- Create: `app/api/gads/callback/route.ts`
- Create: `app/api/gads/accounts/route.ts`

- [ ] **Step 1: Create dashboard layout**

Create `app/dashboard/layout.tsx`:

```tsx
import { AuthGuard } from "@/components/auth-guard";
import { NavBar } from "@/components/nav-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
```

- [ ] **Step 2: Create GAds OAuth connect route**

Create `app/api/gads/connect/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/gads/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/adwords",
    access_type: "offline",
    prompt: "consent",
    state: session.user.id,
  });

  redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
```

- [ ] **Step 3: Create GAds OAuth callback route**

Create `app/api/gads/callback/route.ts`:

```typescript
import { addGadsAccount } from "@/lib/tokens";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const userId = request.nextUrl.searchParams.get("state");

  if (!code || !userId) {
    redirect("/dashboard?error=oauth_failed");
  }

  // Exchange code for tokens
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/gads/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    redirect("/dashboard?error=token_exchange_failed");
  }

  const tokens = await tokenResponse.json();

  // For MVP, store with a placeholder account name — real implementation would
  // call the GAds API to get account info. Use the access token to list accessible customers.
  addGadsAccount(userId, {
    customerId: "placeholder-" + Date.now(),
    name: "Google Ads Account",
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  });

  redirect("/dashboard?connected=true");
}
```

- [ ] **Step 4: Create accounts API route**

Create `app/api/gads/accounts/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { getGadsAccounts } from "@/lib/tokens";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = getGadsAccounts(session.user.id);
  // Strip tokens from response
  const safeAccounts = accounts.map(({ customerId, name }) => ({
    customerId,
    name,
  }));

  return Response.json({ accounts: safeAccounts });
}
```

- [ ] **Step 5: Create dashboard page**

Create `app/dashboard/page.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { getGadsAccounts } from "@/lib/tokens";
import { AccountCard } from "@/components/account-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BarChart3 } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const accounts = getGadsAccounts(session!.user!.id!);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button asChild>
          <a href="/api/gads/connect">
            <Plus className="mr-2 h-4 w-4" />
            Connect Google Ads Account
          </a>
        </Button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No accounts connected"
          description="Connect a Google Ads account to start viewing and cloning campaigns."
          action={
            <Button asChild>
              <a href="/api/gads/connect">Connect Account</a>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.customerId}
                name={account.name}
                customerId={account.customerId}
              />
            ))}
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/campaigns">View Campaigns</Link>
          </Button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Verify dashboard renders**

```bash
npm run dev
```

Navigate to `/dashboard` (will redirect to sign-in with placeholder creds — that's expected). Verify the page structure renders if you temporarily bypass auth.

- [ ] **Step 7: Commit**

```bash
git add app/dashboard app/api/gads
git commit -m "feat: add dashboard layout, GAds OAuth routes, and connected accounts page"
```

---

## Task 8: GAds API Client & Campaign Fetching

**Files:**
- Create: `lib/gads/client.ts`
- Create: `lib/gads/campaigns.ts`
- Create: `lib/gads/adgroups.ts`
- Create: `lib/gads/ads.ts`
- Create: `lib/gads/mock-data.ts` (for development without real credentials)
- Create: `app/api/gads/campaigns/route.ts`
- Create: `app/api/gads/campaigns/[id]/route.ts`
- Create: `app/api/gads/adgroups/route.ts`
- Create: `app/api/gads/ads/route.ts`
- Test: `lib/gads/__tests__/campaigns.test.ts`

- [ ] **Step 1: Install google-ads-api**

```bash
npm install google-ads-api
```

Check context7 for the latest `google-ads-api` Node.js package API before proceeding.

- [ ] **Step 2: Write campaign transform tests**

Create `lib/gads/__tests__/campaigns.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { transformCampaign } from "@/lib/gads/campaigns";

describe("transformCampaign", () => {
  it("transforms raw GAds API response to GadsCampaign", () => {
    const raw = {
      campaign: {
        id: "123",
        name: "Test Campaign",
        status: "ENABLED",
        advertising_channel_type: "SEARCH",
        bidding_strategy_type: "TARGET_CPA",
        network_settings: {
          target_google_search: true,
          target_search_network: false,
          target_content_network: false,
          target_partner_search_network: false,
        },
        geo_target_type_setting: {
          positive_geo_target_type: "PRESENCE_OR_INTEREST",
          negative_geo_target_type: "PRESENCE",
        },
        start_date: "2026-06-01",
        end_date: "2026-08-31",
      },
      campaign_budget: {
        amount_micros: "50000000",
        delivery_method: "STANDARD",
        period: "DAILY",
      },
    };

    const result = transformCampaign(raw, "456", "Test Account");
    expect(result.id).toBe("123");
    expect(result.name).toBe("Test Campaign");
    expect(result.status).toBe("ENABLED");
    expect(result.budget.amountMicros).toBe(50000000);
    expect(result.accountId).toBe("456");
    expect(result.accountName).toBe("Test Account");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm run test:run -- lib/gads/__tests__/campaigns.test.ts
```

- [ ] **Step 4: Implement GAds client and campaign fetching**

Create `lib/gads/client.ts`:

```typescript
import { GoogleAdsApi } from "google-ads-api";

export function createGadsClient() {
  return new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });
}
```

Create `lib/gads/campaigns.ts` with `transformCampaign` and `fetchCampaigns` functions. The transform normalizes the raw GAds API response into our `GadsCampaign` type. The fetch function uses GAQL to query campaigns.

Create `lib/gads/adgroups.ts` with `fetchAdGroups` and `transformAdGroup`.

Create `lib/gads/ads.ts` with `fetchAds` and `transformAd`.

Create `lib/gads/mock-data.ts` with realistic mock campaign, ad group, and ad data for development without real GAds credentials. Export `MOCK_CAMPAIGNS`, `MOCK_AD_GROUPS`, `MOCK_ADS`. Use `process.env.USE_MOCK_DATA === "true"` to toggle between real and mock.

- [ ] **Step 5: Create API routes**

Create `app/api/gads/campaigns/route.ts` — fetches campaigns from all connected accounts, returns flat list.

Create `app/api/gads/campaigns/[id]/route.ts` — fetches single campaign detail.

Create `app/api/gads/adgroups/route.ts` — fetches ad groups for a campaign (query param `campaignId`).

Create `app/api/gads/ads/route.ts` — fetches ads for an ad group (query param `adGroupId`).

Each route: check auth, get tokens from store, call GAds API (or mock), return JSON.

- [ ] **Step 6: Run tests**

```bash
npm run test:run -- lib/gads/__tests__
```

Expected: all PASS.

- [ ] **Step 7: Add `USE_MOCK_DATA=true` to `.env.local`**

This enables development without real GAds credentials.

- [ ] **Step 8: Commit**

```bash
git add lib/gads app/api/gads .env.local
git commit -m "feat: add GAds API client, campaign fetching, and mock data"
```

---

## Task 9: Campaign List Page with Advanced Filtering

**Files:**
- Create: `app/dashboard/campaigns/page.tsx`
- Create: `components/campaign-table.tsx`
- Create: `components/filter-bar.tsx`
- Test: `components/__tests__/filter-bar.test.tsx`

- [ ] **Step 1: Write filter bar tests**

Create `components/__tests__/filter-bar.test.tsx` — test that filters render, are interactive, show active chips, and can be cleared.

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- components/__tests__/filter-bar.test.tsx
```

- [ ] **Step 3: Implement FilterBar component**

Create `components/filter-bar.tsx` — row of `Select` dropdowns for: Account, Status, Campaign Type, Bidding Strategy, Network, Scheduling. Active filters shown as `Badge` chips with dismiss buttons. "Clear all" button.

- [ ] **Step 4: Implement CampaignTable component**

Create `components/campaign-table.tsx`:
- `Input` search bar at top (searches name + ID, debounced 300ms)
- `FilterBar` component below search
- shadcn `Table` with sortable column headers (Account, Name, ID, Type, Status, Budget, Bidding)
- Each row has `StatusBadge`, budget in `font-mono`, "View" and "Clone to OAI" `Button`s
- Sorting: click header toggles asc/desc, arrow indicator
- Client-side filtering and sorting (all data is already fetched)

- [ ] **Step 5: Create campaigns page**

Create `app/dashboard/campaigns/page.tsx`:
- Server component that fetches campaigns from `/api/gads/campaigns`
- Passes data to `CampaignTable` client component
- Shows `Skeleton` loading state, `EmptyState` if no campaigns, `ErrorState` on failure

- [ ] **Step 6: Run filter tests**

```bash
npm run test:run -- components/__tests__/filter-bar.test.tsx
```

Expected: all PASS.

- [ ] **Step 7: Verify campaign list renders**

```bash
npm run dev
```

Navigate to `/dashboard/campaigns`. With `USE_MOCK_DATA=true`, mock campaigns should render in the table with working search, sort, and filters.

- [ ] **Step 8: Commit**

```bash
git add app/dashboard/campaigns components/campaign-table.tsx components/filter-bar.tsx components/__tests__/filter-bar.test.tsx
git commit -m "feat: add campaign list page with search, sorting, and advanced filtering"
```

---

## Task 10: Campaign Detail Page

**Files:**
- Create: `app/dashboard/campaigns/[id]/page.tsx`
- Create: `components/campaign-detail.tsx`

- [ ] **Step 1: Implement campaign detail component**

Create `components/campaign-detail.tsx`:
- Accepts a `GadsCampaign` prop
- Renders collapsible `Card` sections: Core Info, Budget, Bidding, Network Settings, Geo Targeting, Scheduling, Tracking, Ad Rotation, Shopping Settings (conditional), DSA Settings (conditional), Additional Settings
- Uses `Separator` between sections
- Uses `font-mono` for IDs, budget values, dates
- "Clone to OAI" `Button` at top right

- [ ] **Step 2: Create campaign detail page**

Create `app/dashboard/campaigns/[id]/page.tsx`:
- Server component, fetches campaign by ID from `/api/gads/campaigns/[id]`
- Passes to `CampaignDetail` component
- Back navigation link to campaign list
- Loading skeleton, error state

- [ ] **Step 3: Verify detail page renders**

```bash
npm run dev
```

Click "View" on a campaign in the list → detail page should render with all sections.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/campaigns/[id] components/campaign-detail.tsx
git commit -m "feat: add campaign detail page with collapsible settings sections"
```

---

## Task 11: Clone Flow — Auto Map & Summary

**Files:**
- Create: `app/dashboard/clone/[campaignId]/page.tsx`
- Create: `components/clone-summary.tsx`
- Create: `components/clone-manual-review.tsx`
- Create: `app/api/oai/clone/route.ts`
- Test: `components/__tests__/clone-summary.test.tsx`

- [ ] **Step 1: Write clone summary tests**

Create `components/__tests__/clone-summary.test.tsx` — test that:
- Stats bar shows correct mapped/action-needed counts
- Green sections are collapsed
- Orange sections are expanded
- "Create Draft" button is present
- "Edit Details" button is present

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- components/__tests__/clone-summary.test.tsx
```

- [ ] **Step 3: Create OAI clone API route**

Create `app/api/oai/clone/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { createOAIDraft } from "@/lib/oai/stub";
import type { OAICampaignDraft } from "@/lib/types";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const draft: OAICampaignDraft = await request.json();
  const result = await createOAIDraft(draft);
  return Response.json(result);
}
```

- [ ] **Step 4: Implement clone page**

Create `app/dashboard/clone/[campaignId]/page.tsx` — this is a client component (`"use client"`) that manages the full clone flow state machine:

1. **Pre-flight state**: Level toggles (Campaign always on, Ad Group toggle, Creative toggle) + OAI token check (Dialog prompt if missing) + "Auto Map" button + "Manual Review" link
2. **Reading state**: Fetches campaign data (+ ad groups if toggled, + ads if toggled) from API routes, shows `ProgressSteps` with animated progress
3. **Summary state**: Runs `mapFullCampaign()` client-side, displays `CloneSummary` with editable fields
4. **Manual review state**: `CloneManualReview` with tabbed interface (Campaign / Ad Sets / Creatives)
5. **Creating state**: POSTs to `/api/oai/clone`, shows creating animation
6. **Success state**: Shows confirmation card with draft details, warnings, "Clone Another" button

Use `useState` for the state machine (step: "preflight" | "reading" | "summary" | "manual-review" | "creating" | "success") and `useState` for the draft data.

- [ ] **Step 5: Implement CloneSummary component**

Create `components/clone-summary.tsx`:
- `StatsBar` at top
- `MappingSection` for each level, using `MappingField` for each field
- Green sections (all fields mapped) collapsed
- Orange sections (has action-needed fields) expanded
- "Create Draft" and "Edit Details" buttons at bottom

- [ ] **Step 6: Implement CloneManualReview component**

Create `components/clone-manual-review.tsx`:
- `Tabs` with Campaign / Ad Sets / Creatives
- Each tab shows side-by-side: GAds source (left, `Card` read-only) → OAI mapped (right, `Card` editable)
- For creatives tab: headline/description picker showing all GAds headlines with radio selection

- [ ] **Step 7: Run tests**

```bash
npm run test:run -- components/__tests__/clone-summary.test.tsx
```

Expected: all PASS.

- [ ] **Step 8: Verify full clone flow**

```bash
npm run dev
```

Go to campaign list → click "Clone to OAI" → preflight shows toggles → click "Auto Map" → reading animation → summary page shows mapped fields → fill in orange fields → "Create Draft" → success page with draft ID.

- [ ] **Step 9: Commit**

```bash
git add app/dashboard/clone app/api/oai components/clone-summary.tsx components/clone-manual-review.tsx components/__tests__/clone-summary.test.tsx
git commit -m "feat: add complete clone flow with auto-map, summary, and manual review"
```

---

## Task 12: OAI Token Management

**Files:**
- Create: `app/api/oai/token/route.ts`
- Modify: `app/dashboard/clone/[campaignId]/page.tsx` (token prompt integration)

- [ ] **Step 1: Create OAI token API route**

Create `app/api/oai/token/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { setOaiToken, getOaiToken } from "@/lib/tokens";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = getOaiToken(session.user.id);
  return Response.json({ hasToken: !!token });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { token } = await request.json();
  setOaiToken(session.user.id, token);
  return Response.json({ success: true });
}
```

- [ ] **Step 2: Integrate token check into clone flow**

In the clone page's preflight step, check `/api/oai/token` on mount. If no token, show a `Dialog` with an `Input` for the OAI API token. On submit, POST to `/api/oai/token`, then proceed to auto-map.

- [ ] **Step 3: Commit**

```bash
git add app/api/oai/token app/dashboard/clone
git commit -m "feat: add OAI token management with dialog prompt in clone flow"
```

---

## Task 13: Polish, Error Handling & Loading States

**Files:**
- Modify: all page components (add Skeleton loading, EmptyState, ErrorState)
- Create: `components/toaster-provider.tsx` (toast notifications)

- [ ] **Step 1: Install sonner for toast notifications**

```bash
npx shadcn@latest add sonner
```

- [ ] **Step 2: Add Toaster to root layout**

Add `<Toaster />` from sonner to `app/layout.tsx`.

- [ ] **Step 3: Add loading states to all pages**

- `app/dashboard/campaigns/page.tsx` — `Skeleton` table while fetching
- `app/dashboard/campaigns/[id]/page.tsx` — `Skeleton` sections while fetching
- `app/dashboard/clone/[campaignId]/page.tsx` — `Skeleton` during reading state

- [ ] **Step 4: Add error handling**

- API routes: try/catch, return appropriate error responses
- Pages: catch fetch errors, show `ErrorState` component
- Clone flow: toast on API error during "creating" step
- GAds OAuth callback: handle token exchange failure, redirect with error param

- [ ] **Step 5: Add empty states**

- Campaign list: "No campaigns found" when filters return nothing
- Campaign list: "No accounts connected" when user has zero accounts
- Dashboard: empty state already implemented in Task 7

- [ ] **Step 6: Verify all states work**

```bash
npm run dev
```

Test: loading (slow network via DevTools), empty (no mock data), error (invalid API route).

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add loading skeletons, error handling, empty states, and toast notifications"
```

---

## Task 14: Vercel Deployment

**Files:**
- Modify: `.env.local` (verify all vars)
- Create: `vercel.json` (if needed)

- [ ] **Step 1: Link to Vercel**

```bash
cd /Users/jed/Documents/Liftometer
npx vercel link
```

Follow prompts to create a new Vercel project.

- [ ] **Step 2: Push environment variables**

```bash
vercel env add AUTH_SECRET production preview development
vercel env add AUTH_GOOGLE_ID production preview development
vercel env add AUTH_GOOGLE_SECRET production preview development
vercel env add GOOGLE_ADS_CLIENT_ID production preview development
vercel env add GOOGLE_ADS_CLIENT_SECRET production preview development
vercel env add GOOGLE_ADS_DEVELOPER_TOKEN production preview development
vercel env add USE_MOCK_DATA production preview development
vercel env add NEXT_PUBLIC_APP_URL production preview development
```

Use placeholder values for now.

- [ ] **Step 3: Deploy preview**

```bash
vercel deploy
```

Verify the preview URL loads, sign-in page renders, dark theme works.

- [ ] **Step 4: Commit any deployment config**

```bash
git add .
git commit -m "chore: add Vercel deployment configuration"
```

---

## Task 15: Final Integration Test & Cleanup

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```

Expected: all PASS.

- [ ] **Step 2: Run the full user flow manually**

With `USE_MOCK_DATA=true`:
1. Visit `/` → see landing page
2. Click "Get Started" → sign-in page
3. (Bypass auth for testing) → Dashboard with empty state
4. Navigate to `/dashboard/campaigns` → see mock campaigns in table
5. Search, filter, sort campaigns
6. Click "View" → campaign detail with all sections
7. Click "Clone to OAI" → preflight with toggles
8. Toggle on Ad Group + Creative levels
9. Click "Auto Map" → reading animation → summary
10. Verify green/orange sections correct
11. Fill in orange fields
12. Click "Create Draft" → creating animation → success
13. Toggle theme dark ↔ light

- [ ] **Step 3: Clean up any TODO comments or unused imports**

Run ESLint:

```bash
npx next lint
```

Fix any issues.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: final cleanup and integration verification"
```

- [ ] **Step 5: Deploy to Vercel**

```bash
vercel deploy
```

Share preview URL for stakeholder review.
