# Liftometer UX Redesign

## Overview

Redesign Liftometer's UI to improve navigation, space usage, visual personality, and settings accessibility. The core change is a sidebar-based layout shell with a streamlined one-click clone workflow. All UI uses shadcn/ui components exclusively. Desktop-focused.

## Core Principles

- **One-click happy path**: The clone flow should be automatic. Complexity only surfaces when auto-mapping fails.
- **Sidebar-driven navigation**: Every page is one click away. No hidden settings. Breadcrumbs provide context.
- **Space efficiency**: Stats, filters, and actions use the full content area. Campaign detail is a slide-over, not a separate page.
- **shadcn/ui only**: All UI built from existing shadcn/ui primitives. No custom UI components.

---

## 1. Layout Shell

### Icon Sidebar (fixed, left, ~56px wide)

- **Top**: Liftometer logo/icon
- **Navigation icons** (each wrapped in shadcn `Tooltip` for hover labels):
  - `LayoutDashboard` icon — Dashboard (`/dashboard`)
  - `Megaphone` icon — Campaigns (`/dashboard/campaigns`)
  - Active state: subtle background fill + accent color on the icon
- **Bottom section** (pushed down with flex spacer):
  - `Settings` icon — Settings (`/dashboard/settings`)
  - `Moon`/`Sun` icon — Theme toggle (reuses existing `ThemeToggle` logic)
- Thin right border (`border-r`) separating sidebar from content

### Main Content Area (right of sidebar)

- **Breadcrumb bar**: top of every page. Text links with `/` separators. Examples:
  - `Dashboard`
  - `Dashboard / Campaigns`
  - `Dashboard / Campaigns / Clone`
- **Page header row**: title (left) + primary action button (right), below breadcrumbs
- **Content**: fills remaining space, consistent `p-6` padding

### Mobile Fallback

- Below `md` breakpoint: sidebar hidden, replaced by hamburger icon in top-left
- Hamburger opens shadcn `Sheet` (slide-in from left) with the same nav items as sidebar
- Minimal effort — functional, not optimized

### Components Affected

- **New**: `AppSidebar` component (sidebar with nav icons + tooltips)
- **New**: `Breadcrumb` component (simple link chain)
- **Modified**: `app/dashboard/layout.tsx` — wraps content in sidebar + main area layout
- **Removed**: `NavBar` component (replaced by sidebar)

---

## 2. Dashboard Page (`/dashboard`)

Replaces the current "account cards only" view with an overview page.

### Stats Row

- 3-4 shadcn `Card` components in a horizontal grid (`grid-cols-3` or `grid-cols-4`)
- Each card: small uppercase label (`text-xs text-muted-foreground`), large number (`text-2xl font-bold`), subtle Lucide icon
- Stats: Total Campaigns, Active/Enabled, Cloned to OAI, Action Needed (yellow accent)
- Data sourced from the same `/api/gads/campaigns` endpoint, aggregated client-side

### Quick Actions Row

- "Clone a Campaign" — shadcn `Button` (default variant), navigates to `/dashboard/campaigns`
- "Connect Account" — shadcn `Button` (outline variant), navigates to `/api/gads/connect`

### Recent Activity

- shadcn `Card` containing a shadcn `Table`
- Last 5-10 clone operations or status changes
- Columns: Campaign name, Action (cloned/enabled/paused), Timestamp
- Clickable rows navigate to relevant campaign
- If no activity: `EmptyState` component with onboarding message
- **Data note**: Current in-memory store doesn't track activity history. This section requires adding a simple activity log to the token store (array of `{ campaignName, action, timestamp }` entries). If this is too much scope, this section can be replaced with a simpler "Your Accounts" summary or deferred.

### Connected Accounts (compact)

- Horizontal list of shadcn `Badge` components (icon + account name)
- "Manage" text link → `/dashboard/settings`

---

## 3. Campaigns Page (`/dashboard/campaigns`)

### Page Header

- Title: "Campaigns"
- Breadcrumb: `Dashboard / Campaigns`

### Filters

- **Status quick-filter**: shadcn `Tabs` component — All | Enabled | Paused | Removed
  - Each tab shows count as a shadcn `Badge` (e.g., "Enabled (18)")
- **Search**: shadcn `Input` with search icon, right-aligned, debounced (300ms)
- **Additional filters**: Account, Type, Bidding Strategy as shadcn `Popover` trigger buttons
  - Active filters shown as removable `Badge` pills below the filter row

### Table

- shadcn `Table` with columns: Name, Account, Type, Status (`Badge`), Budget/day, Bidding Strategy, Actions
- Sortable column headers (click to toggle asc/desc, arrow indicator)
- **Actions column**:
  - "View" — ghost `Button`, opens campaign detail `Sheet`
  - "Clone" — outline `Button`, triggers clone happy-path `Dialog`
- Subtle row hover state

### Campaign Detail (Sheet slide-over)

- Clicking "View" opens a shadcn `Sheet` from the right (side="right", wide — `sm:max-w-lg`)
- **Content**: Same collapsible sections as current `CampaignDetail` component (Core Info, Budget, Bidding, Network Settings, Geo Targeting, Scheduling, Tracking, Ad Rotation, Additional Settings)
- Sheet header: campaign name + "Clone to OAI" button
- Close button (X) or click outside to dismiss
- **No separate route** — the `/dashboard/campaigns/[id]` route is removed

### Components Affected

- **Modified**: `CampaignTable` — add Tabs for status filter, move detail to Sheet trigger
- **Modified**: `FilterBar` — restructure as Popover-based filter pills
- **Modified**: `CampaignDetail` — render inside Sheet instead of standalone page
- **Removed**: `app/dashboard/campaigns/[id]/page.tsx` route

---

## 4. Clone Workflow

### Happy Path (primary experience)

1. User clicks "Clone" on a campaign row (or "Clone to OAI" in the detail Sheet)
2. **Confirmation Dialog** (shadcn `Dialog`) appears:
   - Campaign name and summary (X ad groups, Y ads)
   - Toggle switches for including Ad Groups & Creatives (reuses `LevelToggle` / shadcn `Switch`)
   - If OAI token not set: prompt to add it (inline within dialog, or link to Settings)
   - Primary button: **"Clone Now"**
3. User clicks "Clone Now":
   - Dialog shows a loading state (spinner on the button, or a small progress indicator)
   - Behind the scenes: fetch campaign data → auto-map via `mapFullCampaign()` → POST to `/api/oai/clone`
   - All in one shot, no intermediate "reading" step visible to user
4. **On success**: Dialog closes, success toast (Sonner) with campaign name + link to view draft
5. **Total interaction**: Select campaign → Confirm → Done (3 clicks)

### Fallback Path (when auto-mapping has issues)

If `mapFullCampaign()` returns fields with `status: "action-needed"`:

1. Instead of success, navigate to `/dashboard/clone/[campaignId]`
2. **Banner** at top: shadcn `Alert` with yellow variant — "X fields need your input before creating the draft"
3. **Split-pane layout**:
   - **Left pane** (~45% width): Google Ads source data, read-only
     - Organized in shadcn `Card` sections: Campaign, Ad Groups, Ads
     - Each field: label + value, monospace for IDs/numbers
   - **Right pane** (~55% width): OAI draft, editable
     - Same section structure as left pane
     - Fields that mapped successfully: shown as confirmed (green check, collapsed or dimmed)
     - Fields that need input: highlighted (yellow border), editable via shadcn `Input`/`Select`/date picker
     - Only problem fields are open/prominent by default
   - Panes scroll independently
4. User resolves flagged fields → clicks "Create Draft" button (fixed at bottom or in header)
5. On success: toast + navigate back to campaigns

### Components Affected

- **New**: `CloneConfirmDialog` — confirmation dialog with toggles and loading state
- **Modified**: `app/dashboard/clone/[campaignId]/page.tsx` — becomes the fallback split-pane view only
- **Modified**: `CloneSummary` / `CloneManualReview` — replaced by unified split-pane component
- **Removed**: Preflight step, reading step (animated progress), multi-step wizard state machine
- **Reused**: `MappingField`, `MappingSection` — adapted for the right pane of split view
- **Reused**: `LevelToggle`, `StatsBar` — moved into dialog and fallback banner

---

## 5. Settings Page (`/dashboard/settings`)

First-class page accessible from sidebar bottom.

### Google Ads Accounts Section

- shadcn `Card` with header row: "Google Ads" title + "Connect Account" `Button` (outline)
- shadcn `Table` inside card:
  - Columns: Name, Customer ID, Status (`Badge`: "Connected"), Actions
  - Actions: "Disconnect" `Button` (destructive ghost), triggers `AlertDialog`
- Empty state inside card if no accounts

### OpenAI Ads Section

- shadcn `Card` with header row: "OpenAI Ads" title + "Connect" `Button` (outline)
- If connected: single row — name, masked token ID, `Badge` "Connected", Update/Disconnect buttons
- If not connected: empty state inside card with connect prompt
- Connect/Update triggers shadcn `Dialog` with `Input` fields (name + API key as password)

### Components Affected

- **Modified**: `app/dashboard/settings/page.tsx` — restructure with Card + Table pattern
- **Reused**: Existing `Dialog` and `AlertDialog` for token management and disconnect confirmation

---

## 6. Landing & Sign-In Pages

Minimal changes — these pages are pre-auth and don't use the sidebar layout.

### Landing Page (`/`)

- Centered shadcn `Card` (same structure)
- Add Liftometer logo/icon above card title
- Tagline: "Clone your Google Ads campaigns to OpenAI in one click"
- "Get Started" button → `/sign-in`
- Still redirects to `/dashboard` if authenticated

### Sign-In Page (`/sign-in`)

- Centered shadcn `Card` (same structure)
- Add Liftometer logo above card for brand consistency
- "Sign in with Google" button
- No structural changes

---

## Route Changes Summary

| Current Route | New Route | Change |
|---|---|---|
| `/` | `/` | Polish only |
| `/sign-in` | `/sign-in` | Polish only |
| `/dashboard` | `/dashboard` | New overview page (stats, activity, quick actions) |
| `/dashboard/campaigns` | `/dashboard/campaigns` | Tabs filter, Sheet detail, clone dialog |
| `/dashboard/campaigns/[id]` | *(removed)* | Detail moves to Sheet slide-over on campaigns page |
| `/dashboard/clone/[campaignId]` | `/dashboard/clone/[campaignId]` | Fallback-only split-pane (no wizard) |
| `/dashboard/settings` | `/dashboard/settings` | Card + Table layout, same functionality |

## Component Changes Summary

| Component | Action | Notes |
|---|---|---|
| `NavBar` | Remove | Replaced by `AppSidebar` |
| `AppSidebar` | New | Icon sidebar with tooltips |
| `Breadcrumb` | New | Simple breadcrumb chain |
| `CloneConfirmDialog` | New | Happy-path clone confirmation |
| `CloneSplitPane` | New | Fallback split-pane review |
| `CampaignTable` | Modify | Add Tabs filter, Sheet trigger, clone Dialog trigger |
| `CampaignDetail` | Modify | Render inside Sheet |
| `FilterBar` | Modify | Popover-based filter pills |
| `CloneSummary` | Remove | Replaced by `CloneSplitPane` |
| `CloneManualReview` | Remove | Replaced by `CloneSplitPane` |
| `clone/[campaignId]/page.tsx` | Modify | Fallback-only, no wizard steps |
| `campaigns/[id]/page.tsx` | Remove | Detail is now a Sheet |
| `MappingField` | Reuse | Inside split-pane right panel |
| `MappingSection` | Reuse | Inside split-pane right panel |
| `LevelToggle` | Reuse | Inside clone confirmation dialog |
| `StatsBar` | Reuse | Inside fallback banner |
| `dashboard/layout.tsx` | Modify | Sidebar + content area layout |
| `dashboard/page.tsx` | Modify | New overview with stats/activity |
| `settings/page.tsx` | Modify | Card + Table sections |

## shadcn/ui Components Used

All UI is composed from these existing shadcn/ui components (most already installed):

`Button`, `Card`, `Badge`, `Table`, `Tabs`, `Tooltip`, `Sheet`, `Dialog`, `AlertDialog`, `Input`, `Label`, `Select`, `Switch`, `Popover`, `Skeleton`, `ScrollArea`, `Calendar`, `DropdownMenu`

No new shadcn components need to be added beyond what's already in the project.
