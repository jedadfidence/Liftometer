"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      {/* Right pane: OAI draft (editable) */}
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
