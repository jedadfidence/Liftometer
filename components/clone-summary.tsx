"use client";

import { Button } from "@/components/ui/button";
import { StatsBar } from "@/components/stats-bar";
import { MappingSection } from "@/components/mapping-section";
import { MappingField } from "@/components/mapping-field";
import { formatBudget } from "@/lib/utils";
import type { OAICampaignDraft } from "@/lib/types";

interface CloneSummaryProps {
  draft: OAICampaignDraft;
  onDraftChange: (draft: OAICampaignDraft) => void;
  mappingCounts: { mapped: number; actionNeeded: number };
  onCreateDraft: () => void;
  onEditDetails: () => void;
}

export function CloneSummary({
  draft,
  onDraftChange,
  mappingCounts,
  onCreateDraft,
  onEditDetails,
}: CloneSummaryProps) {
  function updateCampaignField(field: string, value: string) {
    const next = { ...draft };
    switch (field) {
      case "name":
        next.name = value;
        break;
      case "objective":
        next.objective = value as OAICampaignDraft["objective"];
        break;
      case "daily_amount":
        next.budget = { ...next.budget, daily_amount: parseFloat(value) || 0 };
        break;
      case "total_amount":
        next.budget = {
          ...next.budget,
          total_amount: value ? parseFloat(value) || undefined : undefined,
        };
        break;
      case "start_date":
        next.schedule = { ...next.schedule, start_date: value };
        break;
      case "end_date":
        next.schedule = { ...next.schedule, end_date: value || undefined };
        break;
    }
    onDraftChange(next);
  }

  function updateAdSetField(
    adSetIndex: number,
    field: string,
    value: string,
  ) {
    const next = { ...draft, ad_sets: [...draft.ad_sets] };
    const adSet = { ...next.ad_sets[adSetIndex] };

    switch (field) {
      case "name":
        adSet.name = value;
        break;
      case "strategy":
        adSet.bidding = {
          ...adSet.bidding,
          strategy: value as "CPM" | "TARGET_CPA" | "MAXIMIZE_CONVERSIONS",
        };
        break;
      case "cpm_amount":
        adSet.bidding = {
          ...adSet.bidding,
          cpm_amount: parseFloat(value) || undefined,
        };
        break;
      case "target_cpa":
        adSet.bidding = {
          ...adSet.bidding,
          target_cpa: parseFloat(value) || undefined,
        };
        break;
      case "topic_clusters":
        adSet.targeting = {
          ...adSet.targeting,
          topic_clusters: value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
        break;
      case "intent_signals":
        adSet.targeting = {
          ...adSet.targeting,
          intent_signals: value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
        break;
      case "locations":
        adSet.targeting = {
          ...adSet.targeting,
          locations: value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
        break;
      case "languages":
        adSet.targeting = {
          ...adSet.targeting,
          languages: value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
        break;
    }

    next.ad_sets[adSetIndex] = adSet;
    onDraftChange(next);
  }

  function updateCreativeField(
    adSetIndex: number,
    creativeIndex: number,
    field: string,
    value: string,
  ) {
    const next = { ...draft, ad_sets: [...draft.ad_sets] };
    const adSet = { ...next.ad_sets[adSetIndex], creatives: [...next.ad_sets[adSetIndex].creatives] };
    const creative = { ...adSet.creatives[creativeIndex] };

    switch (field) {
      case "headline":
        creative.headline = value;
        break;
      case "description":
        creative.description = value;
        break;
      case "destination_url":
        creative.destination_url = value;
        break;
      case "format":
        creative.format = value as "SPONSORED_CARD" | "PRODUCT_SPOTLIGHT" | "CONTEXTUAL_SIDEBAR";
        break;
    }

    adSet.creatives[creativeIndex] = creative;
    next.ad_sets[adSetIndex] = adSet;
    onDraftChange(next);
  }

  const campaignHasActionNeeded = false;
  const adSetHasActionNeeded = (adSetIndex: number) => {
    const adSet = draft.ad_sets[adSetIndex];
    return (
      adSet.targeting.topic_clusters.length === 0 ||
      adSet.targeting.intent_signals.length === 0 ||
      adSet.targeting.locations.length === 0 ||
      adSet.targeting.languages.length === 0
    );
  };
  const creativeHasActionNeeded = (adSetIndex: number, creativeIndex: number) => {
    const creative = draft.ad_sets[adSetIndex].creatives[creativeIndex];
    return !creative.headline || !creative.description;
  };

  return (
    <div className="space-y-4">
      <StatsBar mapped={mappingCounts.mapped} actionNeeded={mappingCounts.actionNeeded} />

      <MappingSection
        title="Campaign"
        status={campaignHasActionNeeded ? "needs-input" : "complete"}
        defaultOpen={campaignHasActionNeeded}
      >
        <div className="space-y-1">
          <MappingField
            label="Name"
            sourceValue={draft.name}
            mappedValue={draft.name}
            onMappedValueChange={(v) => updateCampaignField("name", v)}
            status="mapped"
          />
          <MappingField
            label="Objective"
            sourceValue={draft.objective}
            mappedValue={draft.objective}
            onMappedValueChange={(v) => updateCampaignField("objective", v)}
            status="mapped"
          />
          <MappingField
            label="Daily Budget"
            sourceValue={formatBudget(draft.budget.daily_amount)}
            mappedValue={String(draft.budget.daily_amount)}
            onMappedValueChange={(v) => updateCampaignField("daily_amount", v)}
            status="mapped"
          />
          <MappingField
            label="Start Date"
            sourceValue={draft.schedule.start_date}
            mappedValue={draft.schedule.start_date}
            onMappedValueChange={(v) => updateCampaignField("start_date", v)}
            status="mapped"
          />
          {draft.schedule.end_date && (
            <MappingField
              label="End Date"
              sourceValue={draft.schedule.end_date}
              mappedValue={draft.schedule.end_date}
              onMappedValueChange={(v) => updateCampaignField("end_date", v)}
              status="mapped"
            />
          )}
        </div>
      </MappingSection>

      {draft.ad_sets.map((adSet, adSetIdx) => (
        <div key={adSet.name + adSetIdx} className="space-y-4">
          <MappingSection
            title={`Ad Set: ${adSet.name}`}
            status={adSetHasActionNeeded(adSetIdx) ? "needs-input" : "complete"}
          >
            <div className="space-y-1">
              <MappingField
                label="Name"
                sourceValue={adSet.name}
                mappedValue={adSet.name}
                onMappedValueChange={(v) => updateAdSetField(adSetIdx, "name", v)}
                status="mapped"
              />
              <MappingField
                label="Bidding Strategy"
                sourceValue={adSet.bidding.strategy}
                mappedValue={adSet.bidding.strategy}
                onMappedValueChange={(v) => updateAdSetField(adSetIdx, "strategy", v)}
                status="mapped"
              />
              {adSet.bidding.cpm_amount !== undefined && (
                <MappingField
                  label="CPM Amount"
                  sourceValue={formatBudget(adSet.bidding.cpm_amount)}
                  mappedValue={String(adSet.bidding.cpm_amount)}
                  onMappedValueChange={(v) => updateAdSetField(adSetIdx, "cpm_amount", v)}
                  status="mapped"
                />
              )}
              {adSet.bidding.target_cpa !== undefined && (
                <MappingField
                  label="Target CPA"
                  sourceValue={formatBudget(adSet.bidding.target_cpa)}
                  mappedValue={String(adSet.bidding.target_cpa)}
                  onMappedValueChange={(v) => updateAdSetField(adSetIdx, "target_cpa", v)}
                  status="mapped"
                />
              )}
              <MappingField
                label="Topic Clusters"
                sourceValue="(not in GAds)"
                mappedValue={adSet.targeting.topic_clusters.join(", ")}
                onMappedValueChange={(v) => updateAdSetField(adSetIdx, "topic_clusters", v)}
                status={adSet.targeting.topic_clusters.length === 0 ? "action-needed" : "mapped"}
              />
              <MappingField
                label="Intent Signals"
                sourceValue="(not in GAds)"
                mappedValue={adSet.targeting.intent_signals.join(", ")}
                onMappedValueChange={(v) => updateAdSetField(adSetIdx, "intent_signals", v)}
                status={adSet.targeting.intent_signals.length === 0 ? "action-needed" : "mapped"}
              />
              <MappingField
                label="Locations"
                sourceValue="(not in GAds)"
                mappedValue={adSet.targeting.locations.join(", ")}
                onMappedValueChange={(v) => updateAdSetField(adSetIdx, "locations", v)}
                status={adSet.targeting.locations.length === 0 ? "action-needed" : "mapped"}
              />
              <MappingField
                label="Languages"
                sourceValue="(not in GAds)"
                mappedValue={adSet.targeting.languages.join(", ")}
                onMappedValueChange={(v) => updateAdSetField(adSetIdx, "languages", v)}
                status={adSet.targeting.languages.length === 0 ? "action-needed" : "mapped"}
              />
            </div>
          </MappingSection>

          {adSet.creatives.map((creative, creativeIdx) => (
            <MappingSection
              key={`creative-${adSetIdx}-${creativeIdx}`}
              title={`Creative: ${creative.headline || "(no headline)"}`}
              status={creativeHasActionNeeded(adSetIdx, creativeIdx) ? "needs-input" : "complete"}
            >
              <div className="space-y-1">
                <MappingField
                  label="Headline"
                  sourceValue={creative.headline || "(empty)"}
                  mappedValue={creative.headline}
                  onMappedValueChange={(v) => updateCreativeField(adSetIdx, creativeIdx, "headline", v)}
                  status={creative.headline ? "mapped" : "action-needed"}
                  maxLength={60}
                />
                <MappingField
                  label="Description"
                  sourceValue={creative.description || "(empty)"}
                  mappedValue={creative.description}
                  onMappedValueChange={(v) => updateCreativeField(adSetIdx, creativeIdx, "description", v)}
                  status={creative.description ? "mapped" : "action-needed"}
                  maxLength={180}
                />
                <MappingField
                  label="Destination URL"
                  sourceValue={creative.destination_url}
                  mappedValue={creative.destination_url}
                  onMappedValueChange={(v) => updateCreativeField(adSetIdx, creativeIdx, "destination_url", v)}
                  status={creative.destination_url ? "mapped" : "action-needed"}
                />
                <MappingField
                  label="Format"
                  sourceValue={creative.format}
                  mappedValue={creative.format}
                  onMappedValueChange={(v) => updateCreativeField(adSetIdx, creativeIdx, "format", v)}
                  status="mapped"
                  editable={false}
                />
              </div>
            </MappingSection>
          ))}
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <Button onClick={onCreateDraft}>Create Draft</Button>
        <Button variant="outline" onClick={onEditDetails}>
          Edit Details
        </Button>
      </div>
    </div>
  );
}
