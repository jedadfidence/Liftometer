# Liftometer MVP Design Spec

**Date**: 2026-03-27
**Status**: Draft
**Author**: Jed + Claude

---

## 1. Purpose

Liftometer enables advertisers to clone their Google Ads campaigns into OpenAI (ChatGPT) Ads as drafts. The primary business goal is to facilitate rapid budget capture from Google Ads to OpenAI's advertising platform.

### V1 Scope

- Sign in with Google (identity only)
- Connect one or more Google Ads accounts (read-only OAuth)
- View campaigns (flat list across all connected accounts) with advanced filtering
- Clone a GAds campaign to an OAI campaign draft (with ad group and ad/creative levels as toggleable options)
- OAI API is stubbed (no public API exists yet)

### Explicitly Out of Scope

- Microsoft SSO (deferred)
- OAI campaign management (read/edit/delete)
- Performance comparison dashboards (Phase 2 "Duels")
- User management / roles / teams
- Database / persistent storage
- Real OAI API integration (stub only)

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 16 (App Router) | Frontend + backend in one project, deploys to Vercel |
| UI | shadcn/ui + Tailwind CSS | Component library, dark/light mode, consistent design |
| Theme | Dark mode default + light mode toggle | Both supported via shadcn theme system |
| Font | Geist Sans (UI) + Geist Mono (IDs, metrics) | Clean, modern, pairs with shadcn |
| Auth (Login) | Auth.js (NextAuth v5) with Google provider | Lightweight, session-only, no DB needed |
| GAds API | `google-ads-api` npm package (Node.js) | REST wrapper for Google Ads API v21 |
| OAI API | Stub module (in-app mock) | No public API exists; returns fake responses |
| Token storage | In-memory server-side Map (keyed by user ID) | Acceptable for MVP; tokens lost on restart |
| Database | None | Tokens in memory, sessions in encrypted cookies |
| Deployment | Vercel (preview URLs) + local dev | Both from day one |

---

## 3. Project Structure

```
Liftometer/
├── app/
│   ├── layout.tsx                  # Root layout, ClerkProvider-style wrapper, theme provider
│   ├── page.tsx                    # Landing / login page
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts           # Auth.js handlers (Google SSO)
│   │   ├── gads/
│   │   │   ├── connect/route.ts   # Initiate GAds OAuth (separate from login)
│   │   │   ├── callback/route.ts  # GAds OAuth callback, store token
│   │   │   ├── accounts/route.ts  # List connected accounts
│   │   │   ├── campaigns/route.ts # Fetch campaigns across accounts
│   │   │   ├── campaigns/[id]/route.ts      # Single campaign detail
│   │   │   ├── adgroups/route.ts  # Fetch ad groups for a campaign
│   │   │   └── ads/route.ts      # Fetch ads for an ad group
│   │   └── oai/
│   │       └── clone/route.ts     # Stub — accepts mapped structure, returns fake draft
│   ├── dashboard/
│   │   ├── layout.tsx             # Auth-gated layout with nav bar, theme toggle
│   │   ├── page.tsx               # Dashboard — connected accounts + connect button
│   │   ├── campaigns/
│   │   │   ├── page.tsx           # Campaign list with advanced filtering
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Campaign detail (read-only, all settings)
│   │   └── clone/
│   │       └── [campaignId]/
│   │           └── page.tsx       # Clone flow (auto-map + summary + manual review)
│   └── sign-in/
│       └── page.tsx               # Google sign-in page
├── lib/
│   ├── auth.ts                    # Auth.js config (Google provider)
│   ├── tokens.ts                  # In-memory token store (Map<userId, GadsToken[]>)
│   ├── gads/
│   │   ├── client.ts             # Google Ads API client factory
│   │   ├── campaigns.ts          # Fetch & transform campaign data
│   │   ├── adgroups.ts           # Fetch & transform ad group data
│   │   └── ads.ts                # Fetch & transform ad data
│   ├── oai/
│   │   ├── stub.ts               # Stub API — accepts OAI draft, returns fake response
│   │   ├── types.ts              # OAI campaign/ad-set/creative type definitions
│   │   └── mapper.ts             # GAds → OAI mapping logic
│   └── utils.ts                   # Shared utilities (micros conversion, etc.)
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── theme-toggle.tsx           # Dark/light mode toggle
│   ├── campaign-table.tsx         # DataTable with filters, sorting, search
│   ├── campaign-detail.tsx        # Sectioned read-only campaign view
│   ├── clone-summary.tsx          # Auto-map results summary
│   ├── clone-manual-review.tsx    # Tabbed manual review interface
│   ├── mapping-field.tsx          # Single field: GAds value → OAI value (editable)
│   └── connect-account.tsx        # GAds OAuth connect button + account list
└── public/
    └── ...                        # Static assets, logo
```

---

## 4. Authentication

### Login (Identity)

- Auth.js with Google provider
- Scopes: `openid profile email` (identity only)
- Session stored in encrypted HTTP-only cookie
- No database — JWT strategy
- Unauthenticated users redirected to `/sign-in`

### GAds OAuth (API Access)

- Separate OAuth flow from login
- Scopes: `https://www.googleapis.com/auth/adwords` (read-only)
- Initiated from Dashboard via "Connect Google Ads Account" button
- Callback stores the access token + refresh token in the in-memory token store, keyed by Auth.js user ID
- One user can connect multiple GAds accounts (each OAuth flow adds to their token list)
- Token includes the GAds customer ID for account identification

### OAI Token (Stubbed)

- Simple text input for now (no real OAuth)
- Prompted when user first attempts a clone and has no OAI token
- Stored in the same in-memory token store

---

## 5. User Flow

### Screen 1: Landing / Login

- Liftometer logo + tagline: "Clone your Google Ads campaigns to OpenAI"
- "Sign in with Google" button (Auth.js)
- Redirects to `/dashboard` on success

### Screen 2: Dashboard

- **Connected Accounts** section: cards showing each connected GAds account (name + customer ID)
- **"Connect Google Ads Account"** button — triggers separate GAds OAuth
- **"View Campaigns"** button/link (visible when at least 1 account connected)
- **Empty state**: explanation + connect button when no accounts connected

### Screen 3: Campaign List

**Search:**
- Single search input at top — searches across campaign name AND campaign ID simultaneously
- Debounced, filters as you type

**Sortable columns** (click header to toggle asc/desc):
- Account, Campaign Name, Campaign ID, Type, Status, Budget, Bidding Strategy

**Filter dropdowns** (row of filter pills below search):
- **Account** — multi-select of connected accounts
- **Status** — Enabled, Paused
- **Campaign Type** — Search, Display, Shopping, Video, Performance Max, Demand Gen, etc.
- **Bidding Strategy** — Manual CPC, Target CPA, Maximize Conversions, Target ROAS, etc.
- **Budget Range** — min/max input
- **Network** — Google Search, Search Partners, Display Network
- **Geo Targeting** — filter by presence of specific geo targets
- **Scheduling** — Active now, Scheduled (future start), Ended

Filters combine with AND logic. Active filters shown as dismissible chips. "Clear all" button.

**Row actions:**
- "View" button → campaign detail page
- "Clone to OAI" button → clone flow

### Screen 4: Campaign Detail

Read-only view of all campaign settings, organized in collapsible sections:

1. **Core Info** — name, ID, status, type, sub-type
2. **Budget** — daily/total amount, delivery method, period
3. **Bidding** — strategy type, target CPA/ROAS, bid ceilings/floors
4. **Network Settings** — Google Search, Search Partners, Display Network
5. **Geo Targeting** — positive/negative geo types
6. **Scheduling** — start/end dates, frequency caps
7. **Tracking** — URL template, custom parameters, final URL suffix
8. **Ad Rotation** — serving optimization status
9. **Shopping Settings** (if applicable) — merchant ID, feed label, priority
10. **Dynamic Search Ads Settings** (if applicable)
11. **Additional Settings** — URL expansion, recommendation opt-in, labels

Only sections relevant to the campaign type are shown.

"Clone to OAI" button at top of page.

### Screen 5: Clone Flow

#### Step 1: Pre-flight

- Check OAI token (prompt if missing — text input for now)
- Show level toggles:

```
Clone Settings
┌─────────────────────────────────────────┐
│ ✅ Campaign Level        (always on)    │
│ ☐  Ad Group Level        (toggle)       │
│ ☐  Ad/Creative Level     (toggle)       │
└─────────────────────────────────────────┘
```

- **"Auto Map"** button (primary) — runs the full mapping
- **"Manual Review"** link (secondary) — opens tabbed interface directly

#### Step 2: Auto Map + Reading Animation

- "Reading Google Ads campaign settings..." with progress indicator
- Shows each section being read (Campaign → Ad Groups → Ads)
- Mapping logic runs server-side

#### Step 3: Clone Summary (Main Screen)

Single page showing all results:

- **Stats banner**: "X fields auto-mapped, Y fields need input"
- **Sections per level** (Campaign, then each Ad Set, then each Creative):
  - **Green (fully mapped)** — collapsed by default, expandable to review
  - **Orange (needs input)** — expanded, with inline editable fields right there
- Fields that need input have clear labels and placeholder text
- "Create Draft" button available immediately (orange fields can be optional)
- "Edit Details" button opens the full tabbed manual review

#### Step 3b: Manual Review (Optional)

Tabbed interface for users who want fine-grained control:

- **Tab 1: Campaign** — side-by-side GAds (left, read-only) → OAI (right, editable)
- **Tab 2: Ad Sets** — list of ad groups → ad sets, each expandable
- **Tab 3: Creatives** — list of ads → creatives, with headline/description picker

Each field shows: GAds value → OAI mapped value (editable). Green "Mapped" badge or orange "Action needed" badge.

#### Step 4: Creating Animation

- "Creating OAI campaign draft..." animation
- Progress for each level being submitted

#### Step 5: Success

- Confirmation card with fake OAI draft details (draft ID, name, status: DRAFT)
- Summary of what was created (1 campaign, N ad sets, M creatives)
- "View in OAI" button (placeholder/disabled — no real OAI dashboard)
- "Clone Another" button → back to campaign list

---

## 6. Three-Level Mapping Specification

### Clone Scope

One OAI draft per GAds campaign. The draft bundles all ad sets and creatives nested inside a single campaign structure.

### Level 1: GAds Campaign → OAI Campaign

**GAds fields read:**

| Field | Description |
|-------|-------------|
| `name` | Campaign name |
| `status` | ENABLED / PAUSED / REMOVED |
| `advertising_channel_type` | SEARCH, DISPLAY, SHOPPING, VIDEO, PERFORMANCE_MAX, etc. |
| `advertising_channel_sub_type` | Sub-type if applicable |
| `campaign_budget.amount_micros` | Daily budget in micros |
| `campaign_budget.total_amount_micros` | Lifetime budget in micros |
| `campaign_budget.delivery_method` | STANDARD / ACCELERATED |
| `campaign_budget.period` | DAILY / CUSTOM_PERIOD |
| `bidding_strategy_type` | Manual CPC, Target CPA, Maximize Conversions, etc. |
| Bidding sub-fields | `target_cpa_micros`, `target_roas`, `cpc_bid_ceiling_micros` |
| `network_settings.*` | Google Search, Search Partners, Display Network booleans |
| `geo_target_type_setting.*` | Positive/negative geo target types |
| `start_date` / `end_date` | Campaign scheduling |
| `tracking_url_template` | Tracking URL |
| `final_url_suffix` | URL suffix |
| `ad_serving_optimization_status` | Ad rotation |
| `url_expansion_opt_out` | For PMax/Demand Gen |

**OAI Campaign output:**

| OAI Field | Mapped from | Auto |
|-----------|-------------|------|
| `name` | campaign.name | Yes |
| `objective` | Inferred from bidding strategy (see mapping table) | Yes |
| `status` | Always `DRAFT` | Auto |
| `budget.daily_amount` | amount_micros / 1,000,000 | Yes |
| `budget.total_amount` | total_amount_micros / 1,000,000 (if set) | Yes |
| `schedule.start_date` | start_date | Yes |
| `schedule.end_date` | end_date (if set) | Yes |

**Objective mapping:**

| GAds Bidding Strategy | OAI Objective |
|----------------------|---------------|
| Maximize Conversions / Target CPA | CONVERSIONS |
| Maximize Conversion Value / Target ROAS | CONVERSIONS |
| Target Impression Share | AWARENESS |
| Maximize Clicks / Manual CPC | TRAFFIC |
| Manual CPM | AWARENESS |
| Manual CPV | CONSIDERATION |

### Level 2: GAds Ad Group → OAI Ad Set

**GAds fields read:**

| Field | Description |
|-------|-------------|
| `name` | Ad group name |
| `status` | ENABLED / PAUSED / REMOVED |
| `type` | SEARCH_STANDARD, DISPLAY_STANDARD, etc. |
| `cpc_bid_micros` | Default CPC bid |
| `cpm_bid_micros` | Default CPM bid |
| `cpv_bid_micros` | Default CPV bid |
| `target_cpa_micros` | Ad group level CPA override |
| `target_roas` | Ad group level ROAS override |
| `ad_rotation_mode` | OPTIMIZE / ROTATE_FOREVER |
| `targeting_setting` | Audience observation vs targeting |
| Criteria | Keywords, audiences, placements, geo targets, languages |

**OAI Ad Set output:**

| OAI Field | Mapped from | Auto |
|-----------|-------------|------|
| `name` | ad_group.name | Yes |
| `status` | `DRAFT` | Auto |
| `bidding.strategy` | CPM (default) or TARGET_CPA | Partial |
| `bidding.cpm_amount` | Default $60 | Default |
| `bidding.target_cpa` | target_cpa_micros / 1M (if set) | Yes |
| `targeting.topic_clusters` | — | No |
| `targeting.intent_signals` | — | No |
| `targeting.locations` | From geo criteria | Yes |
| `targeting.languages` | From language criteria | Yes |
| `targeting.devices` | Default: MOBILE + DESKTOP | Default |
| `targeting.conversation_depth` | Default: ANY | Default |
| `attribution.click_window` | Default: 7_DAY | Default |
| `attribution.view_window` | Default: 1_DAY | Default |
| `attribution.model` | Default: LAST_CLICK | Default |

### Level 3: GAds Ad → OAI Creative

**GAds fields read (Responsive Search Ad focus):**

| Field | Description |
|-------|-------------|
| `type` | RESPONSIVE_SEARCH_AD, EXPANDED_TEXT_AD, etc. |
| `headlines` | Array of AdTextAsset (up to 15, max 30 chars each) |
| `descriptions` | Array of AdTextAsset (up to 4, max 90 chars each) |
| `final_urls` | Landing page URLs |
| `final_mobile_urls` | Mobile URLs |
| `path1` / `path2` | Display URL path segments |
| `tracking_url_template` | Ad-level tracking |
| `pinned_field` | Position pinning |

**OAI Creative output:**

| OAI Field | Mapped from | Auto |
|-----------|-------------|------|
| `headline` (60 chars max) | First GAds headline (truncated) | Partial |
| `description` (180 chars max) | First GAds description (truncated) | Partial |
| `destination_url` | First final_url | Yes |
| `format` | SPONSORED_CARD | Default |

**Creative mapping note:** GAds has up to 15 headlines and 4 descriptions; OAI has 1 headline (60 chars) and 1 description (180 chars). Auto-map picks the first headline and first description. In manual review, the user can see all GAds headlines/descriptions and pick or combine which to use.

---

## 7. OAI Stub API

The stub module (`lib/oai/stub.ts`) accepts the full mapped structure and returns a fake response:

**Input:** `OAICampaignDraft` (campaign + ad sets[] + creatives[])

**Output:**
```typescript
{
  draft_id: string;        // fake UUID
  campaign_name: string;
  status: "DRAFT";
  created_at: string;      // ISO timestamp
  ad_sets_count: number;
  creatives_count: number;
  warnings: string[];      // e.g., "Topic clusters not set for Ad Set 1"
}
```

The stub simulates a 1-2 second delay to make the UX feel realistic.

---

## 8. OAI Mock Type Definitions

```typescript
interface OAICampaignDraft {
  name: string;
  objective: "AWARENESS" | "CONSIDERATION" | "TRAFFIC" | "CONVERSIONS" | "ENGAGEMENT";
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

interface OAIAdSet {
  name: string;
  status: "DRAFT";
  bidding: {
    strategy: "CPM" | "TARGET_CPA" | "MAXIMIZE_CONVERSIONS";
    cpm_amount?: number;
    target_cpa?: number;
  };
  targeting: {
    topic_clusters: string[];
    intent_signals: string[];
    locations: string[];
    languages: string[];
    devices: ("MOBILE" | "DESKTOP")[];
    conversation_depth: "ANY" | "EARLY" | "DEEP";
  };
  attribution: {
    click_window: "1_DAY" | "7_DAY" | "28_DAY";
    view_window: "1_DAY" | "7_DAY" | "28_DAY";
    model: "LAST_CLICK" | "POSITION_BASED" | "TIME_DECAY";
  };
  creatives: OAICreative[];
}

interface OAICreative {
  headline: string;       // max 60 chars
  description: string;    // max 180 chars
  destination_url: string;
  format: "SPONSORED_CARD" | "PRODUCT_SPOTLIGHT" | "CONTEXTUAL_SIDEBAR";
}
```

---

## 9. Non-Functional Requirements

- **Performance**: Campaign list should load in < 3 seconds for up to 500 campaigns
- **Responsiveness**: Desktop-first, but should not break on tablet
- **Error handling**: Toast notifications for API errors, graceful fallbacks
- **Theme**: Dark mode default, light mode available via toggle in nav bar
- **Accessibility**: shadcn/ui provides baseline a11y; ensure keyboard navigation works for filters and clone flow

---

## 10. Known Limitations (MVP)

1. **In-memory token store** — tokens lost on server restart. Acceptable for MVP.
2. **No refresh token rotation** — if GAds token expires, user must reconnect.
3. **OAI API is fully stubbed** — no real integration possible until API is public (late 2026).
4. **No persistent clone history** — once you leave the success page, the draft info is gone.
5. **No real-time campaign sync** — campaigns fetched on demand, no background polling.
6. **Single-user focus** — no team features, sharing, or multi-tenancy.

---

## 11. Future Considerations (Post-MVP)

- Real OAI API integration when available
- Database (Neon Postgres via Vercel Marketplace) for persistent storage
- Clone history tracking
- Campaign comparison dashboards ("Duels" — Phase 2)
- Microsoft SSO
- Team/org support
- Background sync of campaign data
- Webhook for OAI draft status updates
