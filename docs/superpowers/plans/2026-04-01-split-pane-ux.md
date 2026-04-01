# Split Pane UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the clone split pane with resizable columns, collapsible left pane, and color-coded level tags.

**Architecture:** Three isolated changes to existing components. New CSS custom properties for level colors. A new `SourceSection` component for collapsible left-pane sections. The `MappingSection` and `MappingField` components get updated badge styling. `CloneSplitPane` gets the resizable/collapsible layout.

**Tech Stack:** React, Tailwind CSS, shadcn/ui (Badge, ScrollArea), lucide-react icons

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `app/globals.css` | Modify | Add CSS custom properties for level tag colors |
| `components/source-section.tsx` | Create | Simple collapsible section for read-only left pane |
| `components/mapping-section.tsx` | Modify | Add `level` prop, render level tag, update badge styling |
| `components/mapping-field.tsx` | Modify | Update badge styling to tinted style, increase row spacing |
| `components/clone-split-pane.tsx` | Modify | Resizable layout, drag handle, collapsible left pane, use SourceSection, pass level props |

---

## Task 1: Add Level Color CSS Custom Properties

**Files:**
- Modify: `app/globals.css:7-55` (inside `@theme inline`)

- [ ] **Step 1: Add the new CSS custom properties**

In `app/globals.css`, add these lines inside the `@theme inline` block, after the existing `--color-action-needed` line (line 54):

```css
  --color-level-campaign: oklch(0.623 0.214 259.815);
  --color-level-campaign-bg: oklch(0.623 0.214 259.815 / 12%);
  --color-level-campaign-border: oklch(0.623 0.214 259.815 / 25%);
  --color-level-ad-set: oklch(0.627 0.265 303.9);
  --color-level-ad-set-bg: oklch(0.627 0.265 303.9 / 12%);
  --color-level-ad-set-border: oklch(0.627 0.265 303.9 / 25%);
  --color-level-creative: oklch(0.6 0.169 192.876);
  --color-level-creative-bg: oklch(0.6 0.169 192.876 / 12%);
  --color-level-creative-border: oklch(0.6 0.169 192.876 / 25%);
  --color-status-mapped-bg: oklch(0.723 0.219 149.579 / 12%);
  --color-status-mapped-border: oklch(0.723 0.219 149.579 / 25%);
  --color-status-action-bg: oklch(0.795 0.184 86.047 / 12%);
  --color-status-action-border: oklch(0.795 0.184 86.047 / 25%);
```

- [ ] **Step 2: Verify the app still builds**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds (or at least no CSS parse errors)

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add CSS custom properties for level tags and tinted status badges"
```

---

## Task 2: Create SourceSection Component

**Files:**
- Create: `components/source-section.tsx`

- [ ] **Step 1: Create the SourceSection component**

Create `components/source-section.tsx` with this content:

```tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SourceSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SourceSection({ title, defaultOpen = true, children }: SourceSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        {title}
      </button>
      {open && <div className="px-3 py-2">{children}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep source-section || echo "No errors"`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/source-section.tsx
git commit -m "feat: add SourceSection collapsible component for left pane"
```

---

## Task 3: Update MappingSection with Level Tags and Tinted Badges

**Files:**
- Modify: `components/mapping-section.tsx`

- [ ] **Step 1: Replace the entire MappingSection component**

Replace the full contents of `components/mapping-section.tsx` with:

```tsx
"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

type Level = "campaign" | "ad-set" | "creative";

const LEVEL_CONFIG: Record<Level, { label: string; className: string }> = {
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

interface MappingSectionProps {
  title: string;
  level: Level;
  status: "complete" | "needs-input";
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function MappingSection({ title, level, status, defaultOpen, children }: MappingSectionProps) {
  const [open, setOpen] = useState(defaultOpen ?? status === "needs-input");
  const levelConfig = LEVEL_CONFIG[level];

  return (
    <Card>
      <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <Badge
              variant="outline"
              className={`${levelConfig.className} text-[10px] font-semibold tracking-wider uppercase rounded-full px-2 py-0`}
            >
              {levelConfig.label}
            </Badge>
            <span className="text-sm font-medium">{title}</span>
          </div>
          <Badge
            variant="outline"
            className={
              status === "complete"
                ? "bg-[var(--color-status-mapped-bg)] text-[var(--color-mapped)] border-[var(--color-status-mapped-border)] text-[10px] rounded-full"
                : "bg-[var(--color-status-action-bg)] text-[var(--color-action-needed)] border-[var(--color-status-action-border)] text-[10px] rounded-full"
            }
          >
            {status === "complete" ? "Fully mapped" : "Needs input"}
          </Badge>
        </div>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep mapping-section || echo "No errors"`
Expected: TypeScript errors in `clone-split-pane.tsx` because `MappingSection` now requires the `level` prop. This is expected and will be fixed in Task 5.

- [ ] **Step 3: Commit**

```bash
git add components/mapping-section.tsx
git commit -m "feat: add level tags and tinted badge styling to MappingSection"
```

---

## Task 4: Update MappingField Badge Styling and Spacing

**Files:**
- Modify: `components/mapping-field.tsx:203-221`

- [ ] **Step 1: Update the badge and row spacing in MappingField**

In `components/mapping-field.tsx`, replace the outer container div and badge (lines 203-221):

Find this block:
```tsx
    <div className="flex items-center gap-4 py-2">
      <div className="w-1/4 text-sm text-muted-foreground">{label}</div>
      <div className="w-1/4 text-sm font-mono truncate" title={sourceValue}>{sourceValue}</div>
      <div className="w-1/4">{renderControl()}</div>
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
```

Replace with:
```tsx
    <div className="flex items-center gap-4 py-3">
      <div className="w-1/4 text-sm text-muted-foreground">{label}</div>
      <div className="w-1/4 text-sm font-mono truncate" title={sourceValue}>{sourceValue}</div>
      <div className="w-1/4">{renderControl()}</div>
      <div className="w-1/4 flex justify-end">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] rounded-full",
            status === "mapped"
              ? "bg-[var(--color-status-mapped-bg)] text-[var(--color-mapped)] border-[var(--color-status-mapped-border)]"
              : "bg-[var(--color-status-action-bg)] text-[var(--color-action-needed)] border-[var(--color-status-action-border)]"
          )}
        >
          {status === "mapped" ? "Mapped" : "Action needed"}
        </Badge>
      </div>
    </div>
```

Changes: `py-2` → `py-3` for increased row spacing, badge gets tinted style with `variant="outline"`.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep mapping-field || echo "No errors"`
Expected: No errors in this file

- [ ] **Step 3: Commit**

```bash
git add components/mapping-field.tsx
git commit -m "feat: update MappingField badges to tinted style and increase row spacing"
```

---

## Task 5: Rewrite CloneSplitPane with Resizable Layout

**Files:**
- Modify: `components/clone-split-pane.tsx`

This is the largest change. The component gets:
- Mouse-draggable resize handle between panes
- Collapsible left pane with header and vertical "Source" tab when collapsed
- Left pane sections using `SourceSection`
- Right pane `MappingSection` calls updated with `level` prop and cleaned titles

- [ ] **Step 1: Replace the entire CloneSplitPane component**

Replace the full contents of `components/clone-split-pane.tsx` with:

```tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { MappingField } from "@/components/mapping-field";
import { MappingSection } from "@/components/mapping-section";
import { SourceSection } from "@/components/source-section";
import { formatBudget, microsToUsd } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, PanelLeftClose } from "lucide-react";
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

const MIN_LEFT_WIDTH = 20;
const MAX_LEFT_WIDTH = 65;
const DEFAULT_LEFT_WIDTH = 42;

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
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT_WIDTH);
  const [collapsed, setCollapsed] = useState(false);
  const [widthBeforeCollapse, setWidthBeforeCollapse] = useState(DEFAULT_LEFT_WIDTH);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (collapsed) return;
    e.preventDefault();
    dragging.current = true;

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(MAX_LEFT_WIDTH, Math.max(MIN_LEFT_WIDTH, pct)));
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [collapsed]);

  function handleCollapse() {
    setWidthBeforeCollapse(leftWidth);
    setCollapsed(true);
  }

  function handleExpand() {
    setCollapsed(false);
    setLeftWidth(widthBeforeCollapse);
  }

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
    <div ref={containerRef} className="flex h-[calc(100vh-220px)]">
      {/* Left pane or collapsed tab */}
      {collapsed ? (
        <button
          type="button"
          onClick={handleExpand}
          className="flex w-9 flex-col items-center justify-start pt-4 border-r border-border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
        >
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mb-2" />
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide [writing-mode:vertical-rl]">
            Source
          </span>
        </button>
      ) : (
        <div className="flex flex-col shrink-0" style={{ width: `${leftWidth}%` }}>
          {/* Left pane header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Google Ads Source</span>
            </div>
            <button
              type="button"
              onClick={handleCollapse}
              className="flex items-center gap-1 rounded-md bg-muted/50 border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
              Hide
            </button>
          </div>

          {/* Left pane content */}
          <ScrollArea className="flex-1">
            <div className="space-y-2 p-3">
              <SourceSection title="Campaign">
                <SourceField label="Name" value={campaign.name} />
                <SourceField label="Status" value={campaign.status} />
                <SourceField label="Type" value={campaign.advertisingChannelType} />
                <SourceField label="Bidding" value={campaign.biddingStrategyType} />
                <SourceField label="Daily Budget" value={formatBudget(microsToUsd(campaign.budget.amountMicros))} />
                <SourceField label="Start Date" value={campaign.startDate ?? "Not set"} />
                <SourceField label="End Date" value={campaign.endDate ?? "Not set"} />
              </SourceSection>

              {adGroups.map((ag) => (
                <SourceSection key={ag.id} title={`Ad Group: ${ag.name}`}>
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

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-1.5 shrink-0 flex items-center justify-center ${
          collapsed
            ? "bg-border/30"
            : "bg-border/50 hover:bg-border cursor-col-resize transition-colors"
        }`}
      >
        {!collapsed && (
          <div className="w-0.5 h-8 rounded-full bg-muted-foreground/30" />
        )}
      </div>

      {/* Right pane */}
      <ScrollArea className="flex-1 min-w-0">
        <div className="space-y-3 p-3">
          <MappingSection title={draft.name || "General Settings"} level="campaign" status="complete" defaultOpen={false}>
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
              <MappingSection key={idx} title={adSet.name} level="ad-set" status={needsInput ? "needs-input" : "complete"}>
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
                    <MappingSection key={cIdx} title={creative.headline || "(no headline)"} level="creative" status={cNeedsInput ? "needs-input" : "complete"}>
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

Key changes from the original:
- CSS grid replaced with flexbox + percentage width + `containerRef` for drag calculations
- `collapsed` / `widthBeforeCollapse` state for collapse/expand
- `handleMouseDown` attaches mousemove/mouseup to document for drag resizing
- Left pane uses `SourceSection` instead of `Card`
- Left pane has a header bar with "Google Ads Source" and "Hide" button
- Collapsed state shows a narrow vertical "Source" tab
- Right pane `MappingSection` calls now include `level` prop
- Section titles cleaned: `"Ad Set: {name}"` → `"{name}"`, `"Creative: {headline}"` → `"{headline}"`
- `Card`/`CardContent`/`CardHeader`/`CardTitle` imports removed (no longer used in this file)

- [ ] **Step 2: Verify the full app compiles**

Run: `npx tsc --noEmit 2>&1 | tail -10`
Expected: No TypeScript errors

- [ ] **Step 3: Verify the dev server renders the page**

Run: `npx next dev` and navigate to a clone page. Verify:
- Left pane shows "Google Ads Source" header with "Hide" button
- Left sections are collapsible (chevron toggles)
- Drag handle resizes the panes
- "Hide" collapses left pane to vertical "Source" tab
- Clicking "Source" tab restores the left pane
- Right pane sections show colored level tags before titles
- Status badges use the tinted style
- Field rows have adequate spacing (no badge overlap)

- [ ] **Step 4: Commit**

```bash
git add components/clone-split-pane.tsx
git commit -m "feat: resizable split pane with collapsible left column and level tags"
```

---

## Task 6: Visual QA and Polish

**Files:**
- Possibly modify: any file from Tasks 1-5

- [ ] **Step 1: Run the dev server and test the full flow**

Navigate to a clone page and verify every spec requirement:

1. **Drag handle**: drag left/right, respects min (20%) and max (65%) bounds
2. **Collapse**: click "Hide" → left pane collapses to vertical "Source" tab → right pane fills width
3. **Expand**: click vertical "Source" tab → left pane restores to previous width
4. **Left sections**: all open by default, clickable header toggles content, no status badges
5. **Level tags**: `[CAMPAIGN]` blue, `[AD SET]` violet, `[CREATIVE]` teal — all before the title
6. **Status badges**: tinted style (green for mapped, amber for needs-input) on both MappingSection headers and MappingField rows
7. **Row spacing**: no badge overlap in field rows
8. **Section titles**: no "Ad Set:" or "Creative:" prefixes — level info is in the tag

- [ ] **Step 2: Fix any visual issues found**

Address spacing, color, or layout issues. Common things to check:
- Badge text readability in both light and dark modes
- Drag handle visibility
- Collapsed tab alignment
- Scroll behavior in both panes

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "fix: visual QA polish for split pane UX improvements"
```

Only commit this if there were actual fixes. Skip if everything looked correct.
