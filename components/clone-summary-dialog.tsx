"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, EyeOff, ChevronRight, X, Pencil, Plus, LayoutGrid, Globe } from "lucide-react";
import {
  Dialog,
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
