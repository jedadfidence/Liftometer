"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatBudget } from "@/lib/utils";
import type {
  OAICampaignDraft,
  GadsCampaign,
  GadsAdGroup,
  GadsAd,
} from "@/lib/types";

interface CloneManualReviewProps {
  draft: OAICampaignDraft;
  campaign: GadsCampaign;
  adGroups: GadsAdGroup[];
  adsByAdGroup: Record<string, GadsAd[]>;
  onDraftChange: (draft: OAICampaignDraft) => void;
}

function FieldRow({
  label,
  gadsValue,
  oaiValue,
  onChange,
}: {
  label: string;
  gadsValue: string;
  oaiValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr_1fr] items-center gap-4 py-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <span className="text-sm font-mono bg-muted/50 rounded px-2 py-1">
        {gadsValue}
      </span>
      <Input
        value={oaiValue}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm"
      />
    </div>
  );
}

function ExpandableSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export function CloneManualReview({
  draft,
  campaign,
  adGroups,
  adsByAdGroup,
  onDraftChange,
}: CloneManualReviewProps) {
  function updateDraft(updater: (d: OAICampaignDraft) => OAICampaignDraft) {
    onDraftChange(updater({ ...draft, ad_sets: draft.ad_sets.map((a) => ({ ...a })) }));
  }

  return (
    <Tabs defaultValue="campaign">
      <TabsList>
        <TabsTrigger value="campaign">Campaign</TabsTrigger>
        <TabsTrigger value="adsets">Ad Sets</TabsTrigger>
        <TabsTrigger value="creatives">Creatives</TabsTrigger>
      </TabsList>

      <TabsContent value="campaign" className="mt-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Google Ads (Source)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-mono">{campaign.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Bidding Strategy</Label>
                <p className="font-mono">{campaign.biddingStrategyType}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Daily Budget</Label>
                <p className="font-mono">
                  {formatBudget(campaign.budget.amountMicros / 1_000_000)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Start Date</Label>
                <p className="font-mono">{campaign.startDate ?? "Not set"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">End Date</Label>
                <p className="font-mono">{campaign.endDate ?? "Not set"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className="font-mono">{campaign.status}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">OpenAI Ads (Draft)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) =>
                    updateDraft((d) => ({ ...d, name: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Objective</Label>
                <Input
                  value={draft.objective}
                  onChange={(e) =>
                    updateDraft((d) => ({
                      ...d,
                      objective: e.target.value as OAICampaignDraft["objective"],
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Daily Budget</Label>
                <Input
                  value={String(draft.budget.daily_amount)}
                  onChange={(e) =>
                    updateDraft((d) => ({
                      ...d,
                      budget: {
                        ...d.budget,
                        daily_amount: parseFloat(e.target.value) || 0,
                      },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Start Date</Label>
                <Input
                  value={draft.schedule.start_date}
                  onChange={(e) =>
                    updateDraft((d) => ({
                      ...d,
                      schedule: { ...d.schedule, start_date: e.target.value },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">End Date</Label>
                <Input
                  value={draft.schedule.end_date ?? ""}
                  onChange={(e) =>
                    updateDraft((d) => ({
                      ...d,
                      schedule: {
                        ...d.schedule,
                        end_date: e.target.value || undefined,
                      },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className="font-mono mt-1">{draft.status}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="adsets" className="mt-4 space-y-4">
        {adGroups.map((adGroup, agIdx) => {
          const adSet = draft.ad_sets[agIdx];
          if (!adSet) return null;
          return (
            <ExpandableSection
              key={adGroup.id}
              title={`${adGroup.name} → ${adSet.name}`}
              defaultOpen={agIdx === 0}
            >
              <div className="space-y-1">
                <FieldRow
                  label="Name"
                  gadsValue={adGroup.name}
                  oaiValue={adSet.name}
                  onChange={(v) => {
                    const next = { ...draft, ad_sets: [...draft.ad_sets] };
                    next.ad_sets[agIdx] = { ...next.ad_sets[agIdx], name: v };
                    onDraftChange(next);
                  }}
                />
                <FieldRow
                  label="Strategy"
                  gadsValue={adGroup.type}
                  oaiValue={adSet.bidding.strategy}
                  onChange={(v) => {
                    const next = { ...draft, ad_sets: [...draft.ad_sets] };
                    next.ad_sets[agIdx] = {
                      ...next.ad_sets[agIdx],
                      bidding: {
                        ...next.ad_sets[agIdx].bidding,
                        strategy: v as "CPM" | "TARGET_CPA" | "MAXIMIZE_CONVERSIONS",
                      },
                    };
                    onDraftChange(next);
                  }}
                />
                <FieldRow
                  label="Topics"
                  gadsValue="(N/A)"
                  oaiValue={adSet.targeting.topic_clusters.join(", ")}
                  onChange={(v) => {
                    const next = { ...draft, ad_sets: [...draft.ad_sets] };
                    next.ad_sets[agIdx] = {
                      ...next.ad_sets[agIdx],
                      targeting: {
                        ...next.ad_sets[agIdx].targeting,
                        topic_clusters: v
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    };
                    onDraftChange(next);
                  }}
                />
                <FieldRow
                  label="Intent"
                  gadsValue="(N/A)"
                  oaiValue={adSet.targeting.intent_signals.join(", ")}
                  onChange={(v) => {
                    const next = { ...draft, ad_sets: [...draft.ad_sets] };
                    next.ad_sets[agIdx] = {
                      ...next.ad_sets[agIdx],
                      targeting: {
                        ...next.ad_sets[agIdx].targeting,
                        intent_signals: v
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    };
                    onDraftChange(next);
                  }}
                />
                <FieldRow
                  label="Locations"
                  gadsValue="(N/A)"
                  oaiValue={adSet.targeting.locations.join(", ")}
                  onChange={(v) => {
                    const next = { ...draft, ad_sets: [...draft.ad_sets] };
                    next.ad_sets[agIdx] = {
                      ...next.ad_sets[agIdx],
                      targeting: {
                        ...next.ad_sets[agIdx].targeting,
                        locations: v
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    };
                    onDraftChange(next);
                  }}
                />
                <FieldRow
                  label="Languages"
                  gadsValue="(N/A)"
                  oaiValue={adSet.targeting.languages.join(", ")}
                  onChange={(v) => {
                    const next = { ...draft, ad_sets: [...draft.ad_sets] };
                    next.ad_sets[agIdx] = {
                      ...next.ad_sets[agIdx],
                      targeting: {
                        ...next.ad_sets[agIdx].targeting,
                        languages: v
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    };
                    onDraftChange(next);
                  }}
                />
              </div>
            </ExpandableSection>
          );
        })}
      </TabsContent>

      <TabsContent value="creatives" className="mt-4 space-y-4">
        {adGroups.map((adGroup, agIdx) => {
          const ads = adsByAdGroup[adGroup.id] ?? [];
          const adSet = draft.ad_sets[agIdx];
          if (!adSet) return null;
          return ads.map((ad, adIdx) => {
            const creative = adSet.creatives[adIdx];
            if (!creative) return null;
            return (
              <ExpandableSection
                key={ad.id}
                title={`${ad.headlines[0] ?? "Ad"} → ${creative.headline || "(no headline)"}`}
                defaultOpen={agIdx === 0 && adIdx === 0}
              >
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Available GAds Headlines (click to use)
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {ad.headlines.map((hl, hlIdx) => (
                        <Button
                          key={hlIdx}
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            const next = {
                              ...draft,
                              ad_sets: [...draft.ad_sets],
                            };
                            const nextAdSet = {
                              ...next.ad_sets[agIdx],
                              creatives: [...next.ad_sets[agIdx].creatives],
                            };
                            nextAdSet.creatives[adIdx] = {
                              ...nextAdSet.creatives[adIdx],
                              headline: hl.slice(0, 60),
                            };
                            next.ad_sets[agIdx] = nextAdSet;
                            onDraftChange(next);
                          }}
                        >
                          {hl}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <FieldRow
                    label="Headline"
                    gadsValue={ad.headlines[0] ?? ""}
                    oaiValue={creative.headline}
                    onChange={(v) => {
                      const next = {
                        ...draft,
                        ad_sets: [...draft.ad_sets],
                      };
                      const nextAdSet = {
                        ...next.ad_sets[agIdx],
                        creatives: [...next.ad_sets[agIdx].creatives],
                      };
                      nextAdSet.creatives[adIdx] = {
                        ...nextAdSet.creatives[adIdx],
                        headline: v,
                      };
                      next.ad_sets[agIdx] = nextAdSet;
                      onDraftChange(next);
                    }}
                  />
                  <FieldRow
                    label="Description"
                    gadsValue={ad.descriptions[0] ?? ""}
                    oaiValue={creative.description}
                    onChange={(v) => {
                      const next = {
                        ...draft,
                        ad_sets: [...draft.ad_sets],
                      };
                      const nextAdSet = {
                        ...next.ad_sets[agIdx],
                        creatives: [...next.ad_sets[agIdx].creatives],
                      };
                      nextAdSet.creatives[adIdx] = {
                        ...nextAdSet.creatives[adIdx],
                        description: v,
                      };
                      next.ad_sets[agIdx] = nextAdSet;
                      onDraftChange(next);
                    }}
                  />
                  <FieldRow
                    label="URL"
                    gadsValue={ad.finalUrls[0] ?? ""}
                    oaiValue={creative.destination_url}
                    onChange={(v) => {
                      const next = {
                        ...draft,
                        ad_sets: [...draft.ad_sets],
                      };
                      const nextAdSet = {
                        ...next.ad_sets[agIdx],
                        creatives: [...next.ad_sets[agIdx].creatives],
                      };
                      nextAdSet.creatives[adIdx] = {
                        ...nextAdSet.creatives[adIdx],
                        destination_url: v,
                      };
                      next.ad_sets[agIdx] = nextAdSet;
                      onDraftChange(next);
                    }}
                  />
                  <FieldRow
                    label="Format"
                    gadsValue={ad.type}
                    oaiValue={creative.format}
                    onChange={(v) => {
                      const next = {
                        ...draft,
                        ad_sets: [...draft.ad_sets],
                      };
                      const nextAdSet = {
                        ...next.ad_sets[agIdx],
                        creatives: [...next.ad_sets[agIdx].creatives],
                      };
                      nextAdSet.creatives[adIdx] = {
                        ...nextAdSet.creatives[adIdx],
                        format: v as "SPONSORED_CARD" | "PRODUCT_SPOTLIGHT" | "CONTEXTUAL_SIDEBAR",
                      };
                      next.ad_sets[agIdx] = nextAdSet;
                      onDraftChange(next);
                    }}
                  />
                </div>
              </ExpandableSection>
            );
          });
        })}
      </TabsContent>
    </Tabs>
  );
}
