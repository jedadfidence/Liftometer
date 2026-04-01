# Clone Summary Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the toast-only clone feedback with a verification dialog showing the mapped draft in a two-column read-only layout before the user confirms.

**Architecture:** New `CloneSummaryDialog` component using shadcn `Dialog` with a custom wide layout. Left pane reuses `SourceSection` for Google Ads source data. Right pane uses a new `DraftSection` component for read-only OAI draft display. `CloneConfirmDialog` is modified to open the summary dialog instead of calling the API directly when all fields map cleanly.

**Tech Stack:** React, shadcn/ui Dialog, Lucide icons, existing `SourceSection` + `ScrollArea` components, Tailwind CSS.

---

### Task 1: Create `DraftSection` Component

A read-only collapsible section for displaying OAI draft fields. Similar to `SourceSection` but uses Card styling like `MappingSection` and includes a status badge.

**Files:**
- Create: `components/draft-section.tsx`

- [ ] **Step 1: Create the component file**

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

type DraftLevel = "campaign" | "ad-set" | "creative";

const LEVEL_CONFIG: Record<DraftLevel, { label: string; className: string }> = {
  campaign: {
    label: "CAMPAIGN",
    className: "bg-[var(--color-level-campaign-bg)] text-[var(--color-level-campaign)] border-[var(--color-level-campaign-border)]",
  },
  "ad-set": {
    label: "AD SET",
    className: "bg-[var(--color-level-ad-set-bg)] text-[var(--color-level-ad-set)] border-[var(--color-level-ad-set-border)]",
  },
  creative: {
    label: "CREATIVE",
    className: "bg-[var(--color-level-creative-bg)] text-[var(--color-level-creative)] border-[var(--color-level-creative-border)]",
  },
};

interface DraftSectionProps {
  title: string;
  level: DraftLevel;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function DraftSection({ title, level, defaultOpen = false, open: controlledOpen, onOpenChange, children }: DraftSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;
  const levelConfig = LEVEL_CONFIG[level];

  function toggle() {
    const next = !isOpen;
    onOpenChange?.(next);
    if (controlledOpen === undefined) setInternalOpen(next);
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer py-3 px-4" onClick={toggle}>
        <div className="flex items-center gap-2.5">
          {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <Badge
            variant="outline"
            className={`${levelConfig.className} text-[10px] font-semibold tracking-[0.5px] uppercase rounded-full px-2 py-0`}
          >
            {levelConfig.label}
          </Badge>
          <span className="text-sm font-medium">{title}</span>
        </div>
      </CardHeader>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export function DraftField({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-1.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-mono mt-0.5">{value || "—"}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty`
Expected: No errors related to `draft-section.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/draft-section.tsx
git commit -m "feat: add DraftSection read-only collapsible component"
```

---

### Task 2: Create `CloneSummaryDialog` Component

The main dialog with two-column layout: source data (left) and draft summary (right).

**Files:**
- Create: `components/clone-summary-dialog.tsx`

- [ ] **Step 1: Create the component file**

```tsx
"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, EyeOff, ChevronRight, X, Pencil, Plus, LayoutGrid, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SourceSection } from "@/components/source-section";
import { DraftSection, DraftField } from "@/components/draft-section";
import { countMappingResults } from "@/lib/oai/mapper";
import { formatBudget, microsToUsd } from "@/lib/utils";
import type { GadsCampaign, GadsAdGroup, GadsAd } from "@/lib/types/gads";
import type { OAICampaignDraft } from "@/lib/types/oai";

interface CloneSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: GadsCampaign;
  adGroups: GadsAdGroup[];
  adsByAdGroup: Record<string, GadsAd[]>;
  draft: OAICampaignDraft;
  onConfirm: () => void;
  onEdit: () => void;
}

export function CloneSummaryDialog({
  open,
  onOpenChange,
  campaign,
  adGroups,
  adsByAdGroup,
  draft,
  onConfirm,
  onEdit,
}: CloneSummaryDialogProps) {
  const [sourceCollapsed, setSourceCollapsed] = useState(false);
  const { mapped, actionNeeded } = countMappingResults(draft);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-border">
            <h2 className="text-base font-semibold">Clone: {campaign.name}</h2>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-mapped)]" />
                {mapped} mapped
              </span>
              {actionNeeded > 0 && (
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-[var(--color-action-needed)]" />
                  {actionNeeded} need input
                </span>
              )}
            </div>
          </div>

          {/* Two-column body */}
          <div className="flex" style={{ height: "min(380px, 50vh)" }}>
            {/* Left: Google Ads Source */}
            {sourceCollapsed ? (
              <button
                type="button"
                onClick={() => setSourceCollapsed(false)}
                className="flex w-9 flex-col items-center justify-start pt-4 border-r border-border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
              >
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mb-2" />
                <span className="text-[11px] font-medium text-muted-foreground tracking-wide [writing-mode:vertical-rl]">
                  Source
                </span>
              </button>
            ) : (
              <div className="flex flex-col shrink-0 w-[280px] border-r border-border">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
                  <div className="flex items-center gap-1.5">
                    <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">Google Ads Source</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] text-muted-foreground rounded-full"
                    onClick={() => setSourceCollapsed(true)}
                  >
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hide
                  </Button>
                </div>
                <ScrollArea className="flex-1 overflow-hidden">
                  <div className="space-y-1.5 p-2.5">
                    <SourceSection title={campaign.name} level="campaign" defaultOpen={false}>
                      <SourceField label="Name" value={campaign.name} />
                      <SourceField label="Status" value={campaign.status} />
                      <SourceField label="Type" value={campaign.advertisingChannelType} />
                      <SourceField label="Bidding" value={campaign.biddingStrategyType} />
                      <SourceField label="Daily Budget" value={formatBudget(microsToUsd(campaign.budget.amountMicros))} />
                      <SourceField label="Start Date" value={campaign.startDate ?? "Not set"} />
                      <SourceField label="End Date" value={campaign.endDate ?? "Not set"} />
                    </SourceSection>
                    {adGroups.map((ag) => (
                      <SourceSection key={ag.id} title={ag.name} level="ad-group" defaultOpen={false}>
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
                      </SourceSection>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Right: OpenAI Draft Summary */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border shrink-0">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">OpenAI Ad Settings</span>
              </div>
              <ScrollArea className="flex-1 overflow-hidden">
                <div className="space-y-2 p-2.5">
                  {/* Campaign settings */}
                  <DraftSection title={draft.name || "General Settings"} level="campaign" defaultOpen={true}>
                    <div className="space-y-0">
                      <DraftField label="Name" value={draft.name} />
                      <DraftField label="Objective" value={draft.objective} />
                      <DraftField label="Daily Budget" value={formatBudget(draft.budget.daily_amount)} />
                      <DraftField label="Start Date" value={draft.schedule.start_date} />
                      <DraftField label="End Date" value={draft.schedule.end_date || "Not set"} />
                    </div>
                  </DraftSection>

                  {/* Ad Sets */}
                  {draft.ad_sets.map((adSet, idx) => (
                    <div key={idx} className="space-y-2">
                      <DraftSection title={adSet.name} level="ad-set" defaultOpen={false}>
                        <div className="space-y-0">
                          <DraftField label="Strategy" value={adSet.bidding.strategy} />
                          {adSet.bidding.cpm_amount && <DraftField label="CPM Amount" value={formatBudget(adSet.bidding.cpm_amount)} />}
                          {adSet.bidding.target_cpa && <DraftField label="Target CPA" value={formatBudget(adSet.bidding.target_cpa)} />}
                          <DraftField label="Devices" value={adSet.targeting.devices.join(", ")} />
                          <DraftField label="Topic Clusters" value={adSet.targeting.topic_clusters.join(", ")} />
                          <DraftField label="Intent Signals" value={adSet.targeting.intent_signals.join(", ")} />
                          <DraftField label="Locations" value={adSet.targeting.locations.join(", ")} />
                          <DraftField label="Languages" value={adSet.targeting.languages.join(", ")} />
                        </div>
                      </DraftSection>
                      {adSet.creatives.map((creative, cIdx) => (
                        <div key={cIdx} className="pl-6">
                          <DraftSection title={creative.headline || "(no headline)"} level="creative" defaultOpen={false}>
                            <div className="space-y-0">
                              <DraftField label="Headline" value={creative.headline} />
                              <DraftField label="Description" value={creative.description} />
                              <DraftField label="URL" value={creative.destination_url} />
                              <DraftField label="Format" value={creative.format} />
                            </div>
                          </DraftSection>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Draft
              </Button>
              <Button
                className="rounded-full"
                onClick={onConfirm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Draft
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function SourceField({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-1.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <p className="text-sm font-mono mt-0.5">{value || "—"}</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty`
Expected: No errors related to `clone-summary-dialog.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/clone-summary-dialog.tsx
git commit -m "feat: add CloneSummaryDialog two-column verification dialog"
```

---

### Task 3: Wire `CloneSummaryDialog` into `CloneConfirmDialog`

Modify the existing clone confirm flow so that when all fields map cleanly (`actionNeeded === 0`), it opens the summary dialog instead of calling the API directly.

**Files:**
- Modify: `components/clone-confirm-dialog.tsx`

- [ ] **Step 1: Add state and imports for the summary dialog**

At the top of `clone-confirm-dialog.tsx`, add the import:

```tsx
import { CloneSummaryDialog } from "@/components/clone-summary-dialog";
import type { OAICampaignDraft } from "@/lib/types/oai";
import type { GadsAdGroup, GadsAd } from "@/lib/types/gads";
```

Inside the `CloneConfirmDialog` component, add state variables after the existing ones:

```tsx
const [showSummary, setShowSummary] = useState(false);
const [summaryData, setSummaryData] = useState<{
  adGroups: GadsAdGroup[];
  adsByAdGroup: Record<string, GadsAd[]>;
  draft: OAICampaignDraft;
} | null>(null);
```

- [ ] **Step 2: Modify `handleClone` to open summary dialog instead of calling API**

Replace the block in `handleClone` that runs when `actionNeeded === 0` (currently lines 75-84, from `const res = await fetch("/api/oai/clone"...` to `onOpenChange(false)`) with:

```tsx
// All fields mapped — show summary for verification
setSummaryData({ adGroups, adsByAdGroup, draft });
setShowSummary(true);
onOpenChange(false); // close the confirm dialog
return;
```

The entire new `handleClone` should be:

```tsx
const handleClone = useCallback(async () => {
  setCloning(true);
  try {
    const campaignRes = await fetch(`/api/gads/campaigns/${campaign.id}`);
    if (!campaignRes.ok) throw new Error("Failed to fetch campaign");
    const { campaign: fetchedCampaign } = await campaignRes.json();

    let adGroups: GadsAdGroup[] = [];
    if (includeAdGroups) {
      const agRes = await fetch(`/api/gads/adgroups?campaignId=${campaign.id}`);
      if (!agRes.ok) throw new Error("Failed to fetch ad groups");
      const { adGroups: fetchedAgs } = await agRes.json();
      adGroups = fetchedAgs;
    }

    const adsByAdGroup: Record<string, GadsAd[]> = {};
    if (includeCreatives && adGroups.length > 0) {
      for (const ag of adGroups) {
        const adsRes = await fetch(`/api/gads/ads?adGroupId=${ag.id}`);
        if (!adsRes.ok) throw new Error(`Failed to fetch ads for ${ag.id}`);
        const { ads } = await adsRes.json();
        adsByAdGroup[ag.id] = ads;
      }
    }

    const draft = mapFullCampaign(
      fetchedCampaign,
      includeAdGroups ? adGroups : [],
      includeCreatives ? adsByAdGroup : {},
    );

    const { actionNeeded } = countMappingResults(draft);

    if (actionNeeded > 0) {
      toast.info(`${actionNeeded} fields need your input`);
      onFallback(campaign.id);
      return;
    }

    // All fields mapped — show summary for verification
    setSummaryData({ adGroups, adsByAdGroup, draft });
    setShowSummary(true);
    onOpenChange(false);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Clone failed";
    toast.error(message);
  } finally {
    setCloning(false);
  }
}, [campaign.id, includeAdGroups, includeCreatives, onOpenChange, onFallback]);
```

- [ ] **Step 3: Add the confirm handler**

Add this callback after `handleClone`:

```tsx
const handleConfirmDraft = useCallback(async () => {
  if (!summaryData) return;
  try {
    const res = await fetch("/api/oai/clone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...summaryData.draft, source_campaign_id: campaign.id }),
    });
    if (!res.ok) throw new Error("Failed to create draft");
    const result = await res.json();
    toast.success(`Campaign "${result.campaign_name}" cloned successfully`);
    setShowSummary(false);
    setSummaryData(null);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Clone failed";
    toast.error(message);
  }
}, [summaryData, campaign.id]);
```

- [ ] **Step 4: Render the summary dialog**

Add the `CloneSummaryDialog` after the existing `</Dialog>` closing tag, still inside the component return. The full return should now be:

```tsx
return (
  <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ... existing dialog content unchanged ... */}
    </Dialog>

    {summaryData && (
      <CloneSummaryDialog
        open={showSummary}
        onOpenChange={(open) => {
          setShowSummary(open);
          if (!open) setSummaryData(null);
        }}
        campaign={campaign}
        adGroups={summaryData.adGroups}
        adsByAdGroup={summaryData.adsByAdGroup}
        draft={summaryData.draft}
        onConfirm={handleConfirmDraft}
        onEdit={() => {
          setShowSummary(false);
          setSummaryData(null);
          onFallback(campaign.id);
        }}
      />
    )}
  </>
);
```

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 6: Manual test**

1. Start dev server: `npm run dev`
2. Navigate to campaigns list
3. Click "Clone" on a campaign where all fields auto-map
4. Confirm dialog → click "Clone Now"
5. Verify: summary dialog appears with two-column layout
6. Verify: left pane shows source data (collapsed sections), right pane shows draft (campaign expanded)
7. Verify: "Hide" button collapses left pane to a thin "Source" tab
8. Verify: "Cancel" closes the dialog
9. Verify: "Edit Draft" navigates to `/dashboard/clone/{campaignId}`
10. Verify: "Create Draft" calls the API and shows success toast

- [ ] **Step 7: Commit**

```bash
git add components/clone-confirm-dialog.tsx
git commit -m "feat: wire CloneSummaryDialog into clone confirm flow"
```

---

### Task 4: Update Dialog Overlay Styling

The default dialog overlay uses `bg-black/10` with light blur. The spec calls for `bg-black/60 backdrop-blur-sm`. Since `CloneSummaryDialog` renders its own overlay via `DialogOverlay`, this is handled in Task 2. But verify the default overlay doesn't interfere.

**Files:**
- Verify: `components/ui/dialog.tsx` (no changes needed — the summary dialog bypasses `DialogContent` and uses `DialogPrimitive.Content` directly with its own overlay)

- [ ] **Step 1: Verify no double-overlay**

Open the summary dialog in the browser and inspect the DOM. Confirm there is only one overlay element (the one from `CloneSummaryDialog` with `bg-black/60 backdrop-blur-sm`), not two stacked overlays.

If a double overlay appears, it means the `Dialog` root is rendering its own. Fix by passing `modal={false}` to the `Dialog` in `CloneSummaryDialog` if needed — but this should not happen since we're using `DialogPortal` + `DialogOverlay` + `DialogPrimitive.Content` directly.

- [ ] **Step 2: Commit (only if changes were needed)**

```bash
git add components/clone-summary-dialog.tsx
git commit -m "fix: prevent double overlay in summary dialog"
```

---

### Task 5: Platform-Wide Button Style Update

Update existing buttons touched by this feature to use pill shape + Lucide icons. This covers the `CloneConfirmDialog` buttons. Other buttons across the platform will be updated incrementally in future work.

**Files:**
- Modify: `components/clone-confirm-dialog.tsx`

- [ ] **Step 1: Update CloneConfirmDialog footer buttons**

Replace the existing `DialogFooter` content in `clone-confirm-dialog.tsx`:

```tsx
<DialogFooter>
  <Button variant="outline" onClick={() => onOpenChange(false)} disabled={cloning} className="rounded-full">
    <X className="h-4 w-4 mr-2" />
    Cancel
  </Button>
  <Button onClick={handleClone} disabled={cloning} className="rounded-full">
    {cloning ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cloning...
      </>
    ) : (
      <>
        <Plus className="h-4 w-4 mr-2" />
        Clone Now
      </>
    )}
  </Button>
</DialogFooter>
```

Add `X` and `Plus` to the existing Lucide imports at the top:

```tsx
import { Loader2, X, Plus } from "lucide-react";
```

- [ ] **Step 2: Verify it compiles and looks correct**

Run: `npx tsc --noEmit --pretty`
Open the clone confirm dialog in the browser — buttons should be pill-shaped with icons.

- [ ] **Step 3: Commit**

```bash
git add components/clone-confirm-dialog.tsx
git commit -m "style: update CloneConfirmDialog buttons to pill shape with icons"
```
