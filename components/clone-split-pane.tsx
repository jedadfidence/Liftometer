"use client";

import { useCallback, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { MappingField } from "@/components/mapping-field";
import { MappingSection } from "@/components/mapping-section";
import { SourceSection } from "@/components/source-section";
import { formatBudget, microsToUsd } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, ChevronLeft, ChevronRight, PanelLeftClose } from "lucide-react";
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
  const [showOnlyNeedsInput, setShowOnlyNeedsInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Left pane section states: campaign + each ad group
  const leftSectionCount = 1 + adGroups.length;
  const [leftOpenStates, setLeftOpenStates] = useState<boolean[]>(() => Array(leftSectionCount).fill(true));

  function setLeftOpen(idx: number, open: boolean) {
    setLeftOpenStates(prev => { const next = [...prev]; next[idx] = open; return next; });
  }
  function collapseAllLeft() { setLeftOpenStates(Array(leftSectionCount).fill(false)); }
  function expandAllLeft() { setLeftOpenStates(Array(leftSectionCount).fill(true)); }
  const allLeftCollapsed = leftOpenStates.every(s => !s);

  // Right pane section states: campaign + each ad set + each creative
  const rightSectionCount = 1 + draft.ad_sets.reduce((sum, as) => sum + 1 + as.creatives.length, 0);
  const [rightOpenStates, setRightOpenStates] = useState<boolean[]>(() => {
    const states: boolean[] = [false]; // campaign starts closed
    draft.ad_sets.forEach(adSet => {
      const needsInput = adSet.targeting.topic_clusters.length === 0 ||
        adSet.targeting.intent_signals.length === 0 ||
        adSet.targeting.locations.length === 0 ||
        adSet.targeting.languages.length === 0;
      states.push(needsInput); // ad set open if needs input
      adSet.creatives.forEach(c => {
        states.push(!c.headline || !c.description); // creative open if needs input
      });
    });
    return states;
  });

  function setRightOpen(idx: number, open: boolean) {
    setRightOpenStates(prev => { const next = [...prev]; next[idx] = open; return next; });
  }
  function collapseAllRight() { setRightOpenStates(Array(rightSectionCount).fill(false)); }
  function expandAllRight() { setRightOpenStates(Array(rightSectionCount).fill(true)); }
  const allRightCollapsed = rightOpenStates.every(s => !s);

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
    <div ref={containerRef} className="flex flex-1 min-h-0">
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={allLeftCollapsed ? expandAllLeft : collapseAllLeft}
                className="flex items-center gap-1 rounded-md bg-muted/50 border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                {allLeftCollapsed ? "Expand All" : "Collapse All"}
              </button>
              <button
                type="button"
                onClick={handleCollapse}
                className="flex items-center gap-1 rounded-md bg-muted/50 border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
                Hide
              </button>
            </div>
          </div>

          {/* Left pane content */}
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="space-y-2 p-3">
              <SourceSection title={campaign.name} level="campaign" open={leftOpenStates[0]} onOpenChange={(v) => setLeftOpen(0, v)}>
                <SourceField label="Name" value={campaign.name} />
                <SourceField label="Status" value={campaign.status} />
                <SourceField label="Type" value={campaign.advertisingChannelType} />
                <SourceField label="Bidding" value={campaign.biddingStrategyType} />
                <SourceField label="Daily Budget" value={formatBudget(microsToUsd(campaign.budget.amountMicros))} />
                <SourceField label="Start Date" value={campaign.startDate ?? "Not set"} />
                <SourceField label="End Date" value={campaign.endDate ?? "Not set"} />
              </SourceSection>

              {adGroups.map((ag, agIdx) => (
                <SourceSection key={ag.id} title={ag.name} level="ad-group" open={leftOpenStates[agIdx + 1]} onOpenChange={(v) => setLeftOpen(agIdx + 1, v)}>
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
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            <span className="text-sm font-semibold">OpenAI Ad Settings</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOnlyNeedsInput(!showOnlyNeedsInput)}
              className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                showOnlyNeedsInput
                  ? "bg-[var(--color-status-action-bg)] text-[var(--color-action-needed)] border-[var(--color-status-action-border)]"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              <AlertCircle className="h-3 w-3" />
              Show needs input only
            </button>
            <button
              type="button"
              onClick={allRightCollapsed ? expandAllRight : collapseAllRight}
              className="flex items-center gap-1 rounded-md bg-muted/50 border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              {allRightCollapsed ? "Expand All" : "Collapse All"}
            </button>
          </div>
        </div>
        <ScrollArea className="flex-1 overflow-hidden">
        <div className="space-y-3 p-3">
          {!showOnlyNeedsInput && (
            <MappingSection title={draft.name || "General Settings"} level="campaign" status="complete" open={rightOpenStates[0]} onOpenChange={(v) => setRightOpen(0, v)}>
              <div className="space-y-1">
                <MappingField label="Name" sourceValue={campaign.name} mappedValue={draft.name} onMappedValueChange={(v) => updateField("name", v)} status="mapped" />
                <MappingField label="Objective" sourceValue={draft.objective} mappedValue={draft.objective} onMappedValueChange={(v) => updateField("objective", v)} status="mapped" fieldType="select" options={OBJECTIVE_OPTIONS} />
                <MappingField label="Daily Budget" sourceValue={formatBudget(draft.budget.daily_amount)} mappedValue={String(draft.budget.daily_amount)} onMappedValueChange={(v) => updateField("daily_amount", v)} status="mapped" fieldType="number" />
                <MappingField label="Start Date" sourceValue={draft.schedule.start_date} mappedValue={draft.schedule.start_date} onMappedValueChange={(v) => updateField("start_date", v)} status="mapped" fieldType="date" />
                <MappingField label="End Date" sourceValue={draft.schedule.end_date || "None"} mappedValue={draft.schedule.end_date || ""} onMappedValueChange={(v) => updateField("end_date", v)} status="mapped" fieldType="date" allowNone noneLabel="Run indefinitely" />
              </div>
            </MappingSection>
          )}

          {(() => {
            let rIdx = 1; // start after campaign (index 0)
            return draft.ad_sets.map((adSet, idx) => {
              const adSetIdx = rIdx++;
              const needsInput = adSet.targeting.topic_clusters.length === 0 ||
                adSet.targeting.intent_signals.length === 0 ||
                adSet.targeting.locations.length === 0 ||
                adSet.targeting.languages.length === 0;

              const topicStatus = adSet.targeting.topic_clusters.length === 0 ? "action-needed" as const : "mapped" as const;
              const intentStatus = adSet.targeting.intent_signals.length === 0 ? "action-needed" as const : "mapped" as const;
              const locationStatus = adSet.targeting.locations.length === 0 ? "action-needed" as const : "mapped" as const;
              const languageStatus = adSet.targeting.languages.length === 0 ? "action-needed" as const : "mapped" as const;

              const creativeElements = adSet.creatives.map((creative, cIdx) => {
                const creativeIdx = rIdx++;
                const cNeedsInput = !creative.headline || !creative.description;
                if (showOnlyNeedsInput && !cNeedsInput) return null;
                const headlineStatus = creative.headline ? "mapped" as const : "action-needed" as const;
                const descStatus = creative.description ? "mapped" as const : "action-needed" as const;
                const urlStatus = creative.destination_url ? "mapped" as const : "action-needed" as const;
                return (
                  <MappingSection key={cIdx} title={creative.headline || "(no headline)"} level="creative" status={cNeedsInput ? "needs-input" : "complete"} open={rightOpenStates[creativeIdx]} onOpenChange={(v) => setRightOpen(creativeIdx, v)}>
                    <div className="space-y-1">
                      {(!showOnlyNeedsInput || headlineStatus === "action-needed") && <MappingField label="Headline" sourceValue={creative.headline || "(empty)"} mappedValue={creative.headline} onMappedValueChange={(v) => updateCreativeField(idx, cIdx, "headline", v)} status={headlineStatus} maxLength={60} />}
                      {(!showOnlyNeedsInput || descStatus === "action-needed") && <MappingField label="Description" sourceValue={creative.description || "(empty)"} mappedValue={creative.description} onMappedValueChange={(v) => updateCreativeField(idx, cIdx, "description", v)} status={descStatus} maxLength={180} />}
                      {(!showOnlyNeedsInput || urlStatus === "action-needed") && <MappingField label="URL" sourceValue={creative.destination_url} mappedValue={creative.destination_url} onMappedValueChange={(v) => updateCreativeField(idx, cIdx, "destination_url", v)} status={urlStatus} />}
                      {!showOnlyNeedsInput && <MappingField label="Format" sourceValue={creative.format} mappedValue={creative.format} onMappedValueChange={(v) => updateCreativeField(idx, cIdx, "format", v)} status="mapped" fieldType="select" options={CREATIVE_FORMAT_OPTIONS} />}
                    </div>
                  </MappingSection>
                );
              }).filter(Boolean);

              // Skip entire ad set group if filtering and nothing needs input
              if (showOnlyNeedsInput && !needsInput && creativeElements.length === 0) {
                return null;
              }

              return (
                <div key={idx} className="space-y-3">
                  <MappingSection title={adSet.name} level="ad-set" status={needsInput ? "needs-input" : "complete"} open={rightOpenStates[adSetIdx]} onOpenChange={(v) => setRightOpen(adSetIdx, v)}>
                    <div className="space-y-1">
                      {!showOnlyNeedsInput && <MappingField label="Name" sourceValue={adSet.name} mappedValue={adSet.name} onMappedValueChange={(v) => updateAdSetField(idx, "name", v)} status="mapped" />}
                      {!showOnlyNeedsInput && <MappingField label="Strategy" sourceValue={adSet.bidding.strategy} mappedValue={adSet.bidding.strategy} onMappedValueChange={(v) => updateAdSetField(idx, "strategy", v)} status="mapped" fieldType="select" options={BIDDING_STRATEGY_OPTIONS} />}
                      {!showOnlyNeedsInput && <MappingField label="Devices" sourceValue="(all)" mappedValue={adSet.targeting.devices.join(",")} onMappedValueChange={(v) => updateAdSetField(idx, "devices", v)} status="mapped" fieldType="multi-select" options={DEVICE_OPTIONS} />}
                      {(!showOnlyNeedsInput || topicStatus === "action-needed") && <MappingField label="Topic Clusters" sourceValue="(not in GAds)" mappedValue={adSet.targeting.topic_clusters.join(", ")} onMappedValueChange={(v) => updateAdSetField(idx, "topic_clusters", v)} status={topicStatus} />}
                      {(!showOnlyNeedsInput || intentStatus === "action-needed") && <MappingField label="Intent Signals" sourceValue="(not in GAds)" mappedValue={adSet.targeting.intent_signals.join(", ")} onMappedValueChange={(v) => updateAdSetField(idx, "intent_signals", v)} status={intentStatus} />}
                      {(!showOnlyNeedsInput || locationStatus === "action-needed") && <MappingField label="Locations" sourceValue="(not in GAds)" mappedValue={adSet.targeting.locations.join(", ")} onMappedValueChange={(v) => updateAdSetField(idx, "locations", v)} status={locationStatus} />}
                      {(!showOnlyNeedsInput || languageStatus === "action-needed") && <MappingField label="Languages" sourceValue="(not in GAds)" mappedValue={adSet.targeting.languages.join(", ")} onMappedValueChange={(v) => updateAdSetField(idx, "languages", v)} status={languageStatus} />}
                    </div>
                  </MappingSection>
                  {creativeElements.length > 0 && (
                    <div className="pl-6 space-y-3">
                      {creativeElements}
                    </div>
                  )}
                </div>
              );
            }).filter(Boolean);
          })()}
        </div>
        </ScrollArea>
      </div>
    </div>
  );
}
