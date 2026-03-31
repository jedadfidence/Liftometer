# Liftometer UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Liftometer with a sidebar layout shell, one-click clone workflow, Sheet-based campaign detail, and improved dashboard — all using shadcn/ui components.

**Architecture:** Replace the top NavBar with a fixed icon sidebar. Move campaign detail from a separate route into a Sheet slide-over. Collapse the 6-step clone wizard into a one-click Dialog with a split-pane fallback for mapping issues. Add activity tracking to the in-memory store for the dashboard overview.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Lucide icons, Sonner toasts

---

## File Structure

### New Files
- `components/app-sidebar.tsx` — Icon sidebar with tooltip nav + theme toggle
- `components/breadcrumb-nav.tsx` — Simple breadcrumb chain from pathname
- `components/clone-confirm-dialog.tsx` — One-click clone happy path dialog
- `components/clone-split-pane.tsx` — Fallback split-pane for mapping issues

### Modified Files
- `app/dashboard/layout.tsx` — Replace NavBar with AppSidebar + breadcrumb layout
- `app/dashboard/page.tsx` — New overview page with stats, quick actions, activity
- `app/dashboard/campaigns/page.tsx` — Add Tabs status filter, Sheet detail trigger
- `components/campaign-table.tsx` — Add Sheet for detail, Dialog for clone
- `components/campaign-detail.tsx` — No changes needed (renders inside Sheet as-is)
- `components/filter-bar.tsx` — Minor: works as-is inside new layout
- `app/dashboard/clone/[campaignId]/page.tsx` — Fallback-only split-pane view
- `app/dashboard/settings/page.tsx` — Restructure with Card+Table sections
- `app/page.tsx` — Add tagline
- `app/sign-in/page.tsx` — Add tagline
- `lib/tokens.ts` — Add activity log tracking

### Removed Files
- `components/nav-bar.tsx` — Replaced by AppSidebar
- `app/dashboard/campaigns/[id]/page.tsx` — Detail moves to Sheet
- `components/clone-summary.tsx` — Replaced by clone-split-pane
- `components/clone-manual-review.tsx` — Replaced by clone-split-pane

---

### Task 1: Create AppSidebar Component

**Files:**
- Create: `components/app-sidebar.tsx`

- [ ] **Step 1: Create the AppSidebar component**

```tsx
// components/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/campaigns", icon: Megaphone, label: "Campaigns" },
];

const BOTTOM_ITEMS = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-14 flex-col items-center border-r border-border bg-background py-4">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="mb-6 flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold"
      >
        L
      </Link>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9",
                    active && "bg-accent text-accent-foreground"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-1">
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9",
                    active && "bg-accent text-accent-foreground"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
        <ThemeToggle />
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verify the file was created and has no syntax errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `app-sidebar.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/app-sidebar.tsx
git commit -m "feat: add AppSidebar component with icon nav and tooltips"
```

---

### Task 2: Create BreadcrumbNav Component

**Files:**
- Create: `components/breadcrumb-nav.tsx`

- [ ] **Step 1: Create the BreadcrumbNav component**

```tsx
// components/breadcrumb-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  campaigns: "Campaigns",
  clone: "Clone",
  settings: "Settings",
};

export function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items from path segments
  const crumbs: { label: string; href: string }[] = [];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = SEGMENT_LABELS[segment] ?? segment;
    crumbs.push({ label, href: currentPath });
  }

  if (crumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {isLast ? (
              <span className="text-foreground font-medium">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `breadcrumb-nav.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/breadcrumb-nav.tsx
git commit -m "feat: add BreadcrumbNav component"
```

---

### Task 3: Replace NavBar with Sidebar in Dashboard Layout

**Files:**
- Modify: `app/dashboard/layout.tsx`

- [ ] **Step 1: Update the dashboard layout to use AppSidebar + BreadcrumbNav**

Replace the entire contents of `app/dashboard/layout.tsx` with:

```tsx
import { AuthGuard } from "@/components/auth-guard";
import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <main className="ml-14 p-6">
          <BreadcrumbNav />
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
```

- [ ] **Step 2: Verify the dev server compiles without errors**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds. NavBar is no longer imported but the file still exists (we'll remove it later).

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/layout.tsx
git commit -m "feat: replace NavBar with AppSidebar in dashboard layout"
```

---

### Task 4: Remove NavBar Component

**Files:**
- Remove: `components/nav-bar.tsx`

- [ ] **Step 1: Check no other files import NavBar**

Run: `grep -r "nav-bar\|NavBar" --include="*.tsx" --include="*.ts" app/ components/ lib/ | grep -v node_modules`
Expected: Only `app/dashboard/layout.tsx` (which we already updated) and possibly test files. The old layout no longer imports it.

- [ ] **Step 2: Delete the file**

```bash
rm components/nav-bar.tsx
```

- [ ] **Step 3: Verify build still works**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -u components/nav-bar.tsx
git commit -m "chore: remove NavBar component (replaced by AppSidebar)"
```

---

### Task 5: Add Activity Log to Token Store

**Files:**
- Modify: `lib/tokens.ts`

- [ ] **Step 1: Add activity log types and functions to the token store**

Add the following to the end of `lib/tokens.ts` (before the final closing, or after `clearUserTokens`):

First, add the `ActivityEntry` type and update `UserTokens`:

At the top of `lib/tokens.ts`, after the `OaiConnection` interface, add:

```ts
export interface ActivityEntry {
  campaignName: string;
  action: "cloned" | "connected" | "disconnected";
  timestamp: string;
}
```

Update the `UserTokens` interface to include `activity`:

```ts
interface UserTokens {
  gadsAccounts: GadsAccount[];
  oai?: OaiConnection;
  activity: ActivityEntry[];
}
```

Update `getOrCreate` to initialize activity:

```ts
function getOrCreate(userId: string): UserTokens {
  if (!store.has(userId)) {
    store.set(userId, { gadsAccounts: [], activity: [] });
  }
  return store.get(userId)!;
}
```

Add activity functions at the end of the file:

```ts
// --- Activity ---

export function addActivity(userId: string, entry: Omit<ActivityEntry, "timestamp">): void {
  const tokens = getOrCreate(userId);
  tokens.activity.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  // Keep only last 20 entries
  if (tokens.activity.length > 20) {
    tokens.activity = tokens.activity.slice(0, 20);
  }
}

export function getActivity(userId: string): ActivityEntry[] {
  return store.get(userId)?.activity ?? [];
}
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/tokens.ts
git commit -m "feat: add activity log tracking to token store"
```

---

### Task 6: Add Activity API Route

**Files:**
- Create: `app/api/activity/route.ts`

- [ ] **Step 1: Create the activity GET endpoint**

```ts
// app/api/activity/route.ts
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/get-user-id";
import { getActivity } from "@/lib/tokens";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const activity = getActivity(userId);
  return NextResponse.json({ activity });
}
```

- [ ] **Step 2: Log clone activity in the OAI clone endpoint**

Read the current `app/api/oai/clone/route.ts` file. Add an import for `addActivity` from `@/lib/tokens` and call it after a successful clone. Add this after the draft is created successfully (before the `return`):

```ts
import { addActivity } from "@/lib/tokens";
```

And after the mock response is generated:

```ts
addActivity(userId, { campaignName: body.name, action: "cloned" });
```

(The exact insertion point depends on the current file structure — add the `addActivity` call right before the successful `NextResponse.json` return.)

- [ ] **Step 3: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/api/activity/route.ts app/api/oai/clone/route.ts
git commit -m "feat: add activity API route and log clone events"
```

---

### Task 7: Redesign Dashboard Page

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Rewrite the dashboard page with stats, quick actions, and activity**

Replace the entire contents of `app/dashboard/page.tsx` with:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import {
  Megaphone,
  Activity,
  CheckCircle2,
  AlertCircle,
  Plus,
  Copy,
  Building2,
} from "lucide-react";
import type { GadsCampaign } from "@/lib/types/gads";
import type { ActivityEntry } from "@/lib/tokens";

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<GadsCampaign[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [accounts, setAccounts] = useState<{ customerId: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [campRes, actRes, accRes] = await Promise.all([
          fetch("/api/gads/campaigns"),
          fetch("/api/activity"),
          fetch("/api/gads/accounts"),
        ]);
        const campData = await campRes.json();
        const actData = await actRes.json();
        const accData = await accRes.json();
        setCampaigns(campData.campaigns ?? []);
        setActivity(actData.activity ?? []);
        setAccounts(accData.accounts ?? []);
      } catch {
        // Silently handle — dashboard degrades gracefully
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid gap-4 grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  const enabledCount = campaigns.filter((c) => c.status === "ENABLED").length;
  const clonedCount = activity.filter((a) => a.action === "cloned").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Campaigns
                </p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[var(--color-status-enabled)]" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Active
                </p>
                <p className="text-2xl font-bold">{enabledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Copy className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Cloned to OAI
                </p>
                <p className="text-2xl font-bold">{clonedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard/campaigns">
            <Copy className="mr-2 h-4 w-4" />
            Clone a Campaign
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <a href="/api/gads/connect">
            <Plus className="mr-2 h-4 w-4" />
            Connect Account
          </a>
        </Button>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No activity yet. Clone a campaign to see it here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.slice(0, 10).map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {entry.campaignName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entry.action}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(entry.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Connected Accounts (compact) */}
      {accounts.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Connected:</span>
          <div className="flex gap-2 flex-wrap">
            {accounts.map((acc) => (
              <Badge key={acc.customerId} variant="secondary" className="gap-1">
                <Building2 className="h-3 w-3" />
                {acc.name}
              </Badge>
            ))}
          </div>
          <Link
            href="/dashboard/settings"
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Manage
          </Link>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify the dev server compiles**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: redesign dashboard with stats, activity, and quick actions"
```

---

### Task 8: Add Sheet Campaign Detail and Clone Dialog to Campaign Table

**Files:**
- Modify: `components/campaign-table.tsx`

- [ ] **Step 1: Add Sheet import and state for campaign detail view**

Rewrite `components/campaign-table.tsx` to include Sheet-based detail view and the clone dialog trigger. Replace the entire file:

```tsx
"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, SlidersHorizontal } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CampaignDetail } from "@/components/campaign-detail";
import { CloneConfirmDialog } from "@/components/clone-confirm-dialog";
import { FilterBar, type Filters } from "@/components/filter-bar";
import { formatBudget, microsToUsd } from "@/lib/utils";
import type { GadsCampaign } from "@/lib/types/gads";

type SortColumn =
  | "accountName"
  | "name"
  | "id"
  | "advertisingChannelType"
  | "status"
  | "budget"
  | "biddingStrategyType";

type SortDirection = "asc" | "desc";

const COLUMN_LABELS: Record<SortColumn, string> = {
  accountName: "Account",
  name: "Campaign Name",
  id: "Campaign ID",
  advertisingChannelType: "Type",
  status: "Status",
  budget: "Budget",
  biddingStrategyType: "Bidding Strategy",
};

const FRIENDLY_TYPE: Record<string, string> = {
  SEARCH: "Search", DISPLAY: "Display", SHOPPING: "Shopping", VIDEO: "Video",
  PERFORMANCE_MAX: "Performance Max", DEMAND_GEN: "Demand Gen",
  MULTI_CHANNEL: "Multi Channel", LOCAL: "Local", SMART: "Smart",
  LOCAL_SERVICES: "Local Services", DISCOVERY: "Discovery", TRAVEL: "Travel",
};

const FRIENDLY_BIDDING: Record<string, string> = {
  MANUAL_CPC: "Manual CPC", MANUAL_CPV: "Manual CPV", MANUAL_CPM: "Manual CPM",
  TARGET_CPA: "Target CPA", MAXIMIZE_CONVERSIONS: "Max. Conversions",
  MAXIMIZE_CONVERSION_VALUE: "Max. Conv. Value", TARGET_ROAS: "Target ROAS",
  TARGET_SPEND: "Target Spend", PERCENT_CPC: "Percent CPC",
  TARGET_IMPRESSION_SHARE: "Target Imp. Share",
};

function getSortValue(campaign: GadsCampaign, column: SortColumn): string | number {
  switch (column) {
    case "budget":
      return campaign.budget.amountMicros;
    default:
      return campaign[column];
  }
}

interface CampaignTableProps {
  campaigns: GadsCampaign[];
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  const router = useRouter();
  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filters, setFilters] = useState<Filters>({
    account: [], status: [], type: [], bidding: [],
  });

  // Sheet state for campaign detail
  const [detailCampaign, setDetailCampaign] = useState<GadsCampaign | null>(null);

  // Clone dialog state
  const [cloneCampaign, setCloneCampaign] = useState<GadsCampaign | null>(null);

  // Debounced search — 300ms
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setSearch(rawSearch);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [rawSearch]);

  const handleSort = useCallback(
    (column: SortColumn) => {
      if (sortColumn === column) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    },
    [sortColumn],
  );

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return campaigns
      .filter((c) => {
        if (
          lowerSearch &&
          !c.name.toLowerCase().includes(lowerSearch) &&
          !c.id.toLowerCase().includes(lowerSearch)
        ) return false;
        if (filters.account.length > 0 && !filters.account.includes(c.accountName)) return false;
        if (filters.status.length > 0 && !filters.status.includes(c.status)) return false;
        if (filters.type.length > 0 && !filters.type.includes(c.advertisingChannelType)) return false;
        if (filters.bidding.length > 0 && !filters.bidding.includes(c.biddingStrategyType)) return false;
        return true;
      })
      .sort((a, b) => {
        const aVal = getSortValue(a, sortColumn);
        const bVal = getSortValue(b, sortColumn);
        const cmp = typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
        return sortDirection === "asc" ? cmp : -cmp;
      });
  }, [campaigns, search, filters, sortColumn, sortDirection]);

  function SortIcon({ column }: { column: SortColumn }) {
    if (sortColumn !== column) {
      return <ArrowUpDown className="size-3.5 text-muted-foreground/50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="size-3.5" />
    ) : (
      <ArrowDown className="size-3.5" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search campaigns by name or ID..."
          value={rawSearch}
          onChange={(e) => setRawSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Filter bar */}
      <FilterBar campaigns={campaigns} filters={filters} onFiltersChange={setFilters} />

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No campaigns match your filters"
          description="Try adjusting your search or filter criteria."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRawSearch("");
                setSearch("");
                setFilters({ account: [], status: [], type: [], bidding: [] });
              }}
            >
              Clear all filters
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {(Object.keys(COLUMN_LABELS) as SortColumn[]).map((col) => (
                <TableHead key={col}>
                  <button
                    type="button"
                    onClick={() => handleSort(col)}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    {COLUMN_LABELS[col]}
                    <SortIcon column={col} />
                  </button>
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.accountName}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="font-mono text-muted-foreground text-xs">{c.id}</TableCell>
                <TableCell>{FRIENDLY_TYPE[c.advertisingChannelType] ?? c.advertisingChannelType}</TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell className="font-mono">
                  {formatBudget(microsToUsd(c.budget.amountMicros))}
                  <span className="text-xs text-muted-foreground">/day</span>
                </TableCell>
                <TableCell>{FRIENDLY_BIDDING[c.biddingStrategyType] ?? c.biddingStrategyType}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="ghost" size="xs" onClick={() => setDetailCampaign(c)}>
                      View
                    </Button>
                    <Button variant="secondary" size="xs" onClick={() => setCloneCampaign(c)}>
                      Clone
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Campaign Detail Sheet */}
      <Sheet open={!!detailCampaign} onOpenChange={(open) => { if (!open) setDetailCampaign(null); }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detailCampaign?.name ?? "Campaign Detail"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {detailCampaign && (
              <>
                <CampaignDetail campaign={detailCampaign} />
                <div className="mt-6">
                  <Button onClick={() => { setDetailCampaign(null); setCloneCampaign(detailCampaign); }}>
                    Clone to OAI
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Clone Confirm Dialog */}
      {cloneCampaign && (
        <CloneConfirmDialog
          campaign={cloneCampaign}
          open={!!cloneCampaign}
          onOpenChange={(open) => { if (!open) setCloneCampaign(null); }}
          onFallback={(campaignId) => {
            setCloneCampaign(null);
            router.push(`/dashboard/clone/${campaignId}`);
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: This depends on CloneConfirmDialog which doesn't exist yet — skip type check for now and commit**

```bash
git add components/campaign-table.tsx
git commit -m "feat: add Sheet detail and clone Dialog to campaign table"
```

---

### Task 9: Create CloneConfirmDialog Component

**Files:**
- Create: `components/clone-confirm-dialog.tsx`

- [ ] **Step 1: Create the one-click clone dialog**

```tsx
// components/clone-confirm-dialog.tsx
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LevelToggle } from "@/components/level-toggle";
import { mapFullCampaign, countMappingResults } from "@/lib/oai/mapper";
import type { GadsCampaign, GadsAdGroup, GadsAd } from "@/lib/types";

interface CloneConfirmDialogProps {
  campaign: GadsCampaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFallback: (campaignId: string) => void;
}

export function CloneConfirmDialog({
  campaign,
  open,
  onOpenChange,
  onFallback,
}: CloneConfirmDialogProps) {
  const [includeAdGroups, setIncludeAdGroups] = useState(true);
  const [includeCreatives, setIncludeCreatives] = useState(true);
  const [cloning, setCloning] = useState(false);

  const handleClone = useCallback(async () => {
    setCloning(true);
    try {
      // 1. Fetch campaign data
      const campaignRes = await fetch(`/api/gads/campaigns/${campaign.id}`);
      if (!campaignRes.ok) throw new Error("Failed to fetch campaign");
      const { campaign: fetchedCampaign } = await campaignRes.json();

      // 2. Fetch ad groups if included
      let adGroups: GadsAdGroup[] = [];
      if (includeAdGroups) {
        const agRes = await fetch(`/api/gads/adgroups?campaignId=${campaign.id}`);
        if (!agRes.ok) throw new Error("Failed to fetch ad groups");
        const { adGroups: fetchedAgs } = await agRes.json();
        adGroups = fetchedAgs;
      }

      // 3. Fetch ads if included
      const adsByAdGroup: Record<string, GadsAd[]> = {};
      if (includeCreatives && adGroups.length > 0) {
        for (const ag of adGroups) {
          const adsRes = await fetch(`/api/gads/ads?adGroupId=${ag.id}`);
          if (!adsRes.ok) throw new Error(`Failed to fetch ads for ${ag.id}`);
          const { ads } = await adsRes.json();
          adsByAdGroup[ag.id] = ads;
        }
      }

      // 4. Auto-map
      const draft = mapFullCampaign(
        fetchedCampaign,
        includeAdGroups ? adGroups : [],
        includeCreatives ? adsByAdGroup : {},
      );

      // 5. Check if mapping has issues
      const { actionNeeded } = countMappingResults(draft);

      if (actionNeeded > 0) {
        // Fallback: navigate to split-pane review
        toast.info(`${actionNeeded} fields need your input`);
        onFallback(campaign.id);
        return;
      }

      // 6. Happy path: create draft directly
      const res = await fetch("/api/oai/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Failed to create draft");

      const result = await res.json();
      toast.success(`Campaign "${result.campaign_name}" cloned successfully`);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Clone failed";
      toast.error(message);
    } finally {
      setCloning(false);
    }
  }, [campaign.id, includeAdGroups, includeCreatives, onOpenChange, onFallback]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clone to OpenAI Ads</DialogTitle>
          <DialogDescription>
            Clone &ldquo;{campaign.name}&rdquo; to OpenAI Ads. This will auto-map all fields
            and create a draft.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <LevelToggle
            label="Campaign"
            description="Name, objective, budget, schedule"
            checked={true}
            onCheckedChange={() => {}}
            disabled
          />
          <LevelToggle
            label="Ad Groups → Ad Sets"
            description="Bidding, targeting, attribution settings"
            checked={includeAdGroups}
            onCheckedChange={(checked) => {
              setIncludeAdGroups(checked);
              if (!checked) setIncludeCreatives(false);
            }}
          />
          <LevelToggle
            label="Ads → Creatives"
            description="Headlines, descriptions, URLs, formats"
            checked={includeCreatives}
            onCheckedChange={setIncludeCreatives}
            disabled={!includeAdGroups}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={cloning}>
            Cancel
          </Button>
          <Button onClick={handleClone} disabled={cloning}>
            {cloning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cloning...
              </>
            ) : (
              "Clone Now"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/clone-confirm-dialog.tsx
git commit -m "feat: add CloneConfirmDialog for one-click clone happy path"
```

---

### Task 10: Create Clone Split-Pane Fallback Component

**Files:**
- Create: `components/clone-split-pane.tsx`

- [ ] **Step 1: Create the split-pane component**

```tsx
// components/clone-split-pane.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { MappingField } from "@/components/mapping-field";
import { MappingSection } from "@/components/mapping-section";
import { formatBudget, microsToUsd } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GadsCampaign, GadsAdGroup, GadsAd, OAICampaignDraft } from "@/lib/types";

const OBJECTIVE_OPTIONS = [
  { value: "AWARENESS", label: "Awareness" },
  { value: "CONSIDERATION", label: "Consideration" },
  { value: "TRAFFIC", label: "Traffic" },
  { value: "CONVERSIONS", label: "Conversions" },
  { value: "ENGAGEMENT", label: "Engagement" },
];

const BIDDING_STRATEGY_OPTIONS = [
  { value: "CPM", label: "CPM" },
  { value: "TARGET_CPA", label: "Target CPA" },
  { value: "MAXIMIZE_CONVERSIONS", label: "Maximize Conversions" },
];

const DEVICE_OPTIONS = [
  { value: "MOBILE", label: "Mobile" },
  { value: "DESKTOP", label: "Desktop" },
];

const CREATIVE_FORMAT_OPTIONS = [
  { value: "SPONSORED_CARD", label: "Sponsored Card" },
  { value: "PRODUCT_SPOTLIGHT", label: "Product Spotlight" },
  { value: "CONTEXTUAL_SIDEBAR", label: "Contextual Sidebar" },
];

interface CloneSplitPaneProps {
  campaign: GadsCampaign;
  adGroups: GadsAdGroup[];
  adsByAdGroup: Record<string, GadsAd[]>;
  draft: OAICampaignDraft;
  onDraftChange: (draft: OAICampaignDraft) => void;
}

function SourceField({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="text-sm font-mono mt-0.5">{value || "—"}</p>
    </div>
  );
}

export function CloneSplitPane({
  campaign,
  adGroups,
  adsByAdGroup,
  draft,
  onDraftChange,
}: CloneSplitPaneProps) {
  function updateField(path: string, value: string) {
    const next = structuredClone(draft);
    switch (path) {
      case "name": next.name = value; break;
      case "objective": next.objective = value as typeof next.objective; break;
      case "daily_amount": next.budget.daily_amount = parseFloat(value) || 0; break;
      case "start_date": next.schedule.start_date = value; break;
      case "end_date": next.schedule.end_date = value || undefined; break;
    }
    onDraftChange(next);
  }

  function updateAdSetField(idx: number, field: string, value: string) {
    const next = structuredClone(draft);
    const adSet = next.ad_sets[idx];
    switch (field) {
      case "name": adSet.name = value; break;
      case "strategy": adSet.bidding.strategy = value as typeof adSet.bidding.strategy; break;
      case "cpm_amount": adSet.bidding.cpm_amount = parseFloat(value) || undefined; break;
      case "target_cpa": adSet.bidding.target_cpa = parseFloat(value) || undefined; break;
      case "topic_clusters": adSet.targeting.topic_clusters = value.split(",").map(s => s.trim()).filter(Boolean); break;
      case "intent_signals": adSet.targeting.intent_signals = value.split(",").map(s => s.trim()).filter(Boolean); break;
      case "locations": adSet.targeting.locations = value.split(",").map(s => s.trim()).filter(Boolean); break;
      case "languages": adSet.targeting.languages = value.split(",").map(s => s.trim()).filter(Boolean); break;
      case "devices": adSet.targeting.devices = value.split(",").filter(Boolean) as ("MOBILE" | "DESKTOP")[]; break;
    }
    onDraftChange(next);
  }

  function updateCreativeField(adSetIdx: number, creativeIdx: number, field: string, value: string) {
    const next = structuredClone(draft);
    const creative = next.ad_sets[adSetIdx].creatives[creativeIdx];
    switch (field) {
      case "headline": creative.headline = value; break;
      case "description": creative.description = value; break;
      case "destination_url": creative.destination_url = value; break;
      case "format": creative.format = value as typeof creative.format; break;
    }
    onDraftChange(next);
  }

  return (
    <div className="grid grid-cols-[45%_55%] gap-4 h-[calc(100vh-220px)]">
      {/* Left pane: Source data (read-only) */}
      <ScrollArea className="pr-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Google Ads Source</CardTitle>
            </CardHeader>
            <CardContent>
              <SourceField label="Name" value={campaign.name} />
              <SourceField label="Status" value={campaign.status} />
              <SourceField label="Type" value={campaign.advertisingChannelType} />
              <SourceField label="Bidding" value={campaign.biddingStrategyType} />
              <SourceField label="Daily Budget" value={formatBudget(microsToUsd(campaign.budget.amountMicros))} />
              <SourceField label="Start Date" value={campaign.startDate ?? "Not set"} />
              <SourceField label="End Date" value={campaign.endDate ?? "Not set"} />
            </CardContent>
          </Card>

          {adGroups.map((ag) => (
            <Card key={ag.id}>
              <CardHeader>
                <CardTitle className="text-sm">Ad Group: {ag.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <SourceField label="Type" value={ag.type} />
                <SourceField label="Status" value={ag.status} />
                {ag.targetCpaMicros && (
                  <SourceField label="Target CPA" value={formatBudget(microsToUsd(ag.targetCpaMicros))} />
                )}
                {(adsByAdGroup[ag.id] ?? []).map((ad) => (
                  <div key={ad.id} className="border-t mt-2 pt-2">
                    <SourceField label="Headline" value={ad.headlines[0] ?? ""} />
                    <SourceField label="Description" value={ad.descriptions[0] ?? ""} />
                    <SourceField label="URL" value={ad.finalUrls[0] ?? ""} />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Right pane: OAI draft (editable, only action-needed fields prominent) */}
      <ScrollArea className="pl-4 border-l">
        <div className="space-y-4">
          <MappingSection title="Campaign" status="complete" defaultOpen={false}>
            <div className="space-y-1">
              <MappingField label="Name" sourceValue={campaign.name} mappedValue={draft.name} onMappedValueChange={(v) => updateField("name", v)} status="mapped" />
              <MappingField label="Objective" sourceValue={draft.objective} mappedValue={draft.objective} onMappedValueChange={(v) => updateField("objective", v)} status="mapped" fieldType="select" options={OBJECTIVE_OPTIONS} />
              <MappingField label="Daily Budget" sourceValue={formatBudget(draft.budget.daily_amount)} mappedValue={String(draft.budget.daily_amount)} onMappedValueChange={(v) => updateField("daily_amount", v)} status="mapped" fieldType="number" />
              <MappingField label="Start Date" sourceValue={draft.schedule.start_date} mappedValue={draft.schedule.start_date} onMappedValueChange={(v) => updateField("start_date", v)} status="mapped" fieldType="date" />
              <MappingField label="End Date" sourceValue={draft.schedule.end_date || "None"} mappedValue={draft.schedule.end_date || ""} onMappedValueChange={(v) => updateField("end_date", v)} status="mapped" fieldType="date" allowNone noneLabel="Run indefinitely" />
            </div>
          </MappingSection>

          {draft.ad_sets.map((adSet, idx) => {
            const needsInput = adSet.targeting.topic_clusters.length === 0 ||
              adSet.targeting.intent_signals.length === 0 ||
              adSet.targeting.locations.length === 0 ||
              adSet.targeting.languages.length === 0;
            return (
              <MappingSection key={idx} title={`Ad Set: ${adSet.name}`} status={needsInput ? "needs-input" : "complete"}>
                <div className="space-y-1">
                  <MappingField label="Name" sourceValue={adSet.name} mappedValue={adSet.name} onMappedValueChange={(v) => updateAdSetField(idx, "name", v)} status="mapped" />
                  <MappingField label="Strategy" sourceValue={adSet.bidding.strategy} mappedValue={adSet.bidding.strategy} onMappedValueChange={(v) => updateAdSetField(idx, "strategy", v)} status="mapped" fieldType="select" options={BIDDING_STRATEGY_OPTIONS} />
                  <MappingField label="Devices" sourceValue="(all)" mappedValue={adSet.targeting.devices.join(",")} onMappedValueChange={(v) => updateAdSetField(idx, "devices", v)} status="mapped" fieldType="multi-select" options={DEVICE_OPTIONS} />
                  <MappingField label="Topic Clusters" sourceValue="(not in GAds)" mappedValue={adSet.targeting.topic_clusters.join(", ")} onMappedValueChange={(v) => updateAdSetField(idx, "topic_clusters", v)} status={adSet.targeting.topic_clusters.length === 0 ? "action-needed" : "mapped"} />
                  <MappingField label="Intent Signals" sourceValue="(not in GAds)" mappedValue={adSet.targeting.intent_signals.join(", ")} onMappedValueChange={(v) => updateAdSetField(idx, "intent_signals", v)} status={adSet.targeting.intent_signals.length === 0 ? "action-needed" : "mapped"} />
                  <MappingField label="Locations" sourceValue="(not in GAds)" mappedValue={adSet.targeting.locations.join(", ")} onMappedValueChange={(v) => updateAdSetField(idx, "locations", v)} status={adSet.targeting.locations.length === 0 ? "action-needed" : "mapped"} />
                  <MappingField label="Languages" sourceValue="(not in GAds)" mappedValue={adSet.targeting.languages.join(", ")} onMappedValueChange={(v) => updateAdSetField(idx, "languages", v)} status={adSet.targeting.languages.length === 0 ? "action-needed" : "mapped"} />
                </div>
                {adSet.creatives.map((creative, cIdx) => {
                  const cNeedsInput = !creative.headline || !creative.description;
                  return (
                    <MappingSection key={cIdx} title={`Creative: ${creative.headline || "(no headline)"}`} status={cNeedsInput ? "needs-input" : "complete"}>
                      <div className="space-y-1">
                        <MappingField label="Headline" sourceValue={creative.headline || "(empty)"} mappedValue={creative.headline} onMappedValueChange={(v) => updateCreativeField(idx, cIdx, "headline", v)} status={creative.headline ? "mapped" : "action-needed"} maxLength={60} />
                        <MappingField label="Description" sourceValue={creative.description || "(empty)"} mappedValue={creative.description} onMappedValueChange={(v) => updateCreativeField(idx, cIdx, "description", v)} status={creative.description ? "mapped" : "action-needed"} maxLength={180} />
                        <MappingField label="URL" sourceValue={creative.destination_url} mappedValue={creative.destination_url} onMappedValueChange={(v) => updateCreativeField(idx, cIdx, "destination_url", v)} status={creative.destination_url ? "mapped" : "action-needed"} />
                        <MappingField label="Format" sourceValue={creative.format} mappedValue={creative.format} onMappedValueChange={(v) => updateCreativeField(idx, cIdx, "format", v)} status="mapped" fieldType="select" options={CREATIVE_FORMAT_OPTIONS} />
                      </div>
                    </MappingSection>
                  );
                })}
              </MappingSection>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/clone-split-pane.tsx
git commit -m "feat: add CloneSplitPane fallback component"
```

---

### Task 11: Rewrite Clone Page as Fallback-Only Split-Pane

**Files:**
- Modify: `app/dashboard/clone/[campaignId]/page.tsx`

- [ ] **Step 1: Replace the clone page with the fallback-only split-pane view**

Replace the entire contents of `app/dashboard/clone/[campaignId]/page.tsx` with:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CloneSplitPane } from "@/components/clone-split-pane";
import { StatsBar } from "@/components/stats-bar";
import { mapFullCampaign, countMappingResults } from "@/lib/oai/mapper";
import type { GadsCampaign, GadsAdGroup, GadsAd, OAICampaignDraft } from "@/lib/types";

export default function CloneFallbackPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<GadsCampaign | null>(null);
  const [adGroups, setAdGroups] = useState<GadsAdGroup[]>([]);
  const [adsByAdGroup, setAdsByAdGroup] = useState<Record<string, GadsAd[]>>({});
  const [draft, setDraft] = useState<OAICampaignDraft | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch campaign
        const campRes = await fetch(`/api/gads/campaigns/${campaignId}`);
        if (!campRes.ok) throw new Error("Failed to fetch campaign");
        const { campaign: fetchedCampaign } = await campRes.json();
        setCampaign(fetchedCampaign);

        // Fetch ad groups
        const agRes = await fetch(`/api/gads/adgroups?campaignId=${campaignId}`);
        if (!agRes.ok) throw new Error("Failed to fetch ad groups");
        const { adGroups: fetchedAgs } = await agRes.json();
        setAdGroups(fetchedAgs);

        // Fetch ads per ad group
        const fetchedAds: Record<string, GadsAd[]> = {};
        for (const ag of fetchedAgs) {
          const adsRes = await fetch(`/api/gads/ads?adGroupId=${ag.id}`);
          if (!adsRes.ok) throw new Error(`Failed to fetch ads for ${ag.id}`);
          const { ads } = await adsRes.json();
          fetchedAds[ag.id] = ads;
        }
        setAdsByAdGroup(fetchedAds);

        // Auto-map
        const mapped = mapFullCampaign(fetchedCampaign, fetchedAgs, fetchedAds);
        setDraft(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
        toast.error("Failed to load campaign data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId]);

  const handleCreateDraft = useCallback(async () => {
    if (!draft) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/oai/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Failed to create draft");
      const result = await res.json();
      toast.success(`Campaign "${result.campaign_name}" cloned successfully`);
      router.push("/dashboard/campaigns");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Clone failed");
    } finally {
      setSubmitting(false);
    }
  }, [draft, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Clone Campaign</h1>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !campaign || !draft) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Clone Campaign</h1>
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error ?? "Failed to load campaign"}</p>
          </CardContent>
        </Card>
        <Button variant="outline" onClick={() => router.push("/dashboard/campaigns")}>
          Back to Campaigns
        </Button>
      </div>
    );
  }

  const { mapped, actionNeeded } = countMappingResults(draft);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clone: {campaign.name}</h1>
        <Button onClick={handleCreateDraft} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Draft"
          )}
        </Button>
      </div>

      {actionNeeded > 0 && (
        <Card className="border-[var(--color-action-needed)]">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertCircle className="h-5 w-5 text-[var(--color-action-needed)]" />
            <p className="text-sm">
              <strong>{actionNeeded} fields</strong> need your input before creating the draft.
            </p>
          </CardContent>
        </Card>
      )}

      <StatsBar mapped={mapped} actionNeeded={actionNeeded} />

      <CloneSplitPane
        campaign={campaign}
        adGroups={adGroups}
        adsByAdGroup={adsByAdGroup}
        draft={draft}
        onDraftChange={setDraft}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify build succeeds**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/clone/[campaignId]/page.tsx
git commit -m "feat: rewrite clone page as fallback-only split-pane view"
```

---

### Task 12: Remove Old Clone Components and Campaign Detail Route

**Files:**
- Remove: `components/clone-summary.tsx`
- Remove: `components/clone-manual-review.tsx`
- Remove: `app/dashboard/campaigns/[id]/page.tsx`

- [ ] **Step 1: Verify nothing else imports these files**

Run: `grep -r "clone-summary\|CloneSummary\|clone-manual-review\|CloneManualReview" --include="*.tsx" --include="*.ts" app/ components/ | grep -v node_modules | grep -v __tests__`
Expected: No matches (the clone page no longer imports them)

Run: `grep -r "campaigns/\[id\]" --include="*.tsx" --include="*.ts" app/ components/ | grep -v node_modules`
Expected: No imports pointing to this route (campaign table now uses Sheet)

- [ ] **Step 2: Delete the files**

```bash
rm components/clone-summary.tsx
rm components/clone-manual-review.tsx
rm -rf app/dashboard/campaigns/\[id\]
```

- [ ] **Step 3: Verify build succeeds**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add -u components/clone-summary.tsx components/clone-manual-review.tsx app/dashboard/campaigns/
git commit -m "chore: remove old clone components and campaign detail route"
```

---

### Task 13: Restructure Settings Page

**Files:**
- Modify: `app/dashboard/settings/page.tsx`

- [ ] **Step 1: Rewrite settings with Card+Table pattern**

Replace the entire contents of `app/dashboard/settings/page.tsx` with:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Plus, Building2, Unplug, Plug } from "lucide-react";

interface GadsAccountInfo { customerId: string; name: string; }
interface OaiConnectionInfo { hasToken: boolean; name?: string; maskedId?: string; }

export default function SettingsPage() {
  const [gadsAccounts, setGadsAccounts] = useState<GadsAccountInfo[]>([]);
  const [oaiConnection, setOaiConnection] = useState<OaiConnectionInfo>({ hasToken: false });
  const [loading, setLoading] = useState(true);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenNameInput, setTokenNameInput] = useState("OpenAI Ads");
  const [tokenSaving, setTokenSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [accountsRes, oaiRes] = await Promise.all([
        fetch("/api/gads/accounts"),
        fetch("/api/oai/token"),
      ]);
      const { accounts } = await accountsRes.json();
      const oaiData = await oaiRes.json();
      setGadsAccounts(accounts || []);
      setOaiConnection(oaiData);
    } catch {
      toast.error("Failed to load account data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function disconnectGads(customerId: string) {
    try {
      await fetch(`/api/gads/accounts/${customerId}`, { method: "DELETE" });
      setGadsAccounts((prev) => prev.filter((a) => a.customerId !== customerId));
      toast.success("Google Ads account disconnected");
    } catch {
      toast.error("Failed to disconnect account");
    }
  }

  async function handleOaiTokenSubmit() {
    if (!tokenInput.trim()) return;
    setTokenSaving(true);
    try {
      const res = await fetch("/api/oai/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput.trim(), name: tokenNameInput.trim() || "OpenAI Ads" }),
      });
      if (!res.ok) throw new Error();
      setTokenDialogOpen(false);
      setTokenInput("");
      setTokenNameInput("OpenAI Ads");
      toast.success("OpenAI Ads account connected");
      fetchData();
    } catch {
      toast.error("Failed to save token");
    } finally {
      setTokenSaving(false);
    }
  }

  async function disconnectOai() {
    try {
      await fetch("/api/oai/token", { method: "DELETE" });
      setOaiConnection({ hasToken: false });
      toast.success("OpenAI Ads account disconnected");
    } catch {
      toast.error("Failed to disconnect");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Google Ads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Google Ads</CardTitle>
            <Button size="sm" variant="outline" asChild>
              <a href="/api/gads/connect">
                <Plus className="mr-2 h-4 w-4" />
                Connect Account
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {gadsAccounts.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Google Ads accounts"
              description="Connect a Google Ads account to get started."
              action={<Button size="sm" asChild><a href="/api/gads/connect">Connect Account</a></Button>}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gadsAccounts.map((account) => (
                  <TableRow key={account.customerId}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell className="font-mono text-sm">{account.customerId}</TableCell>
                    <TableCell>
                      <Badge className="bg-[var(--color-status-enabled)] text-white">Connected</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Unplug className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect {account.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This will remove access to campaigns from this account.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => disconnectGads(account.customerId)}>Disconnect</AlertDialogAction>
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

      {/* OpenAI Ads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">OpenAI Ads</CardTitle>
            {!oaiConnection.hasToken && (
              <Button size="sm" onClick={() => setTokenDialogOpen(true)}>
                <Plug className="mr-2 h-4 w-4" />
                Connect
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {oaiConnection.hasToken ? (
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
                  <TableCell className="font-medium">{oaiConnection.name || "OpenAI Ads"}</TableCell>
                  <TableCell className="font-mono text-sm">{oaiConnection.maskedId}</TableCell>
                  <TableCell>
                    <Badge className="bg-[var(--color-status-enabled)] text-white">Connected</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setTokenDialogOpen(true)}>Update</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Unplug className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect OpenAI Ads?</AlertDialogTitle>
                            <AlertDialogDescription>This will remove your API token.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={disconnectOai}>Disconnect</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={Plug}
              title="No OpenAI Ads account"
              description="Connect your OpenAI Ads API token to start cloning campaigns."
              action={<Button size="sm" onClick={() => setTokenDialogOpen(true)}>Connect Account</Button>}
            />
          )}
        </CardContent>
      </Card>

      {/* OAI Token Dialog */}
      <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect OpenAI Ads Account</DialogTitle>
            <DialogDescription>Enter your OpenAI Ads API token.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="oai-name">Account Name</Label>
              <Input id="oai-name" value={tokenNameInput} onChange={(e) => setTokenNameInput(e.target.value)} placeholder="OpenAI Ads" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oai-token">API Token</Label>
              <Input id="oai-token" type="password" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="Enter your API token" onKeyDown={(e) => e.key === "Enter" && handleOaiTokenSubmit()} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleOaiTokenSubmit} disabled={tokenSaving || !tokenInput.trim()}>
              {tokenSaving ? "Saving..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

- [ ] **Step 2: Verify build succeeds**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/settings/page.tsx
git commit -m "feat: restructure settings page with Card+Table pattern"
```

---

### Task 14: Polish Landing and Sign-In Pages

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/sign-in/page.tsx`

- [ ] **Step 1: Update landing page with tagline**

In `app/page.tsx`, change the `CardDescription`:

Replace:
```tsx
          <CardDescription>
            Clone your Google Ads campaigns to OpenAI
          </CardDescription>
```

With:
```tsx
          <CardDescription>
            Clone your Google Ads campaigns to OpenAI in one click
          </CardDescription>
```

- [ ] **Step 2: Update sign-in page with matching tagline**

In `app/sign-in/page.tsx`, change the `CardDescription`:

Replace:
```tsx
          <CardDescription>
            Clone your Google Ads campaigns to OpenAI
          </CardDescription>
```

With:
```tsx
          <CardDescription>
            Clone your Google Ads campaigns to OpenAI in one click
          </CardDescription>
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/sign-in/page.tsx
git commit -m "feat: add tagline to landing and sign-in pages"
```

---

### Task 15: Add Campaigns Page Tabs Filter

**Files:**
- Modify: `app/dashboard/campaigns/page.tsx`

- [ ] **Step 1: Add Tabs-based status quick filter to the campaigns page**

Replace the entire contents of `app/dashboard/campaigns/page.tsx`:

```tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { AlertCircle, Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CampaignTable } from "@/components/campaign-table";
import { EmptyState } from "@/components/empty-state";
import type { GadsCampaign } from "@/lib/types/gads";

type StatusFilter = "ALL" | "ENABLED" | "PAUSED" | "REMOVED";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<GadsCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/gads/campaigns");
        if (!res.ok) throw new Error(`Failed to fetch campaigns (${res.status})`);
        const data = await res.json();
        if (!cancelled) setCampaigns(data.campaigns ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          toast.error("Failed to load campaigns");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { ALL: campaigns.length, ENABLED: 0, PAUSED: 0, REMOVED: 0 };
    for (const c of campaigns) {
      if (c.status === "ENABLED") counts.ENABLED++;
      else if (c.status === "PAUSED") counts.PAUSED++;
      else if (c.status === "REMOVED") counts.REMOVED++;
    }
    return counts;
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    if (statusFilter === "ALL") return campaigns;
    return campaigns.filter((c) => c.status === statusFilter);
  }, [campaigns, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <Skeleton className="h-10 w-96" />
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
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <EmptyState icon={AlertCircle} title="Failed to load campaigns" description={error} />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <EmptyState
          icon={Megaphone}
          title="No campaigns found"
          description="Connect a Google Ads account to see your campaigns here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <TabsList>
          <TabsTrigger value="ALL">
            All <Badge variant="secondary" className="ml-1.5">{statusCounts.ALL}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ENABLED">
            Enabled <Badge variant="secondary" className="ml-1.5">{statusCounts.ENABLED}</Badge>
          </TabsTrigger>
          <TabsTrigger value="PAUSED">
            Paused <Badge variant="secondary" className="ml-1.5">{statusCounts.PAUSED}</Badge>
          </TabsTrigger>
          <TabsTrigger value="REMOVED">
            Removed <Badge variant="secondary" className="ml-1.5">{statusCounts.REMOVED}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <CampaignTable campaigns={filteredCampaigns} />
    </div>
  );
}
```

- [ ] **Step 2: Verify build succeeds**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/campaigns/page.tsx
git commit -m "feat: add Tabs status filter to campaigns page"
```

---

### Task 16: Remove Unused Components and Clean Up

**Files:**
- Check: `components/progress-steps.tsx` — still used anywhere?
- Check: `components/account-card.tsx` — still used anywhere?

- [ ] **Step 1: Check what's still imported**

Run: `grep -r "progress-steps\|ProgressSteps" --include="*.tsx" --include="*.ts" app/ components/ | grep -v node_modules | grep -v __tests__`
Run: `grep -r "account-card\|AccountCard" --include="*.tsx" --include="*.ts" app/ components/ | grep -v node_modules | grep -v __tests__`

Expected: ProgressSteps is no longer imported (clone page was rewritten). AccountCard is no longer imported (dashboard was rewritten).

- [ ] **Step 2: Delete unused components**

```bash
rm components/progress-steps.tsx
rm components/account-card.tsx
```

- [ ] **Step 3: Verify build succeeds**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add -u components/progress-steps.tsx components/account-card.tsx
git commit -m "chore: remove unused ProgressSteps and AccountCard components"
```

---

### Task 17: Full Build and Smoke Test

- [ ] **Step 1: Run full build**

Run: `npm run build 2>&1`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run existing tests**

Run: `npm run test:run 2>&1`
Expected: All existing tests pass. Some tests may fail if they reference removed components — note which ones.

- [ ] **Step 3: Fix any broken tests**

If tests reference `CloneSummary`, `CloneManualReview`, `ProgressSteps`, `AccountCard`, or `NavBar`, delete those test files since the components are removed.

Run: `grep -r "clone-summary\|clone-manual-review\|progress-steps\|account-card\|nav-bar" --include="*.test.*" components/ | grep -v node_modules`

Delete any matched test files, then re-run: `npm run test:run 2>&1`

- [ ] **Step 4: Start dev server and verify pages load**

Run: `npm run dev &` then test each route:
- `http://localhost:3000/` — Landing page with tagline
- `http://localhost:3000/dashboard` — Stats cards, quick actions, activity table
- `http://localhost:3000/dashboard/campaigns` — Tabs filter, table with View/Clone buttons
- `http://localhost:3000/dashboard/settings` — Card+Table sections for GAds and OAI

- [ ] **Step 5: Commit any test fixes**

```bash
git add -A
git commit -m "fix: update tests for redesigned components"
```
