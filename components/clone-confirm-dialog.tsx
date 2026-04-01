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
import type { GadsCampaign, GadsAdGroup, GadsAd } from "@/lib/types/gads";
import { CloneSummaryDialog } from "@/components/clone-summary-dialog";
import type { OAICampaignDraft } from "@/lib/types/oai";

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
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    adGroups: GadsAdGroup[];
    adsByAdGroup: Record<string, GadsAd[]>;
    draft: OAICampaignDraft;
  } | null>(null);

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
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Clone failed";
      toast.error(message);
    } finally {
      setCloning(false);
    }
  }, [campaign.id, includeAdGroups, includeCreatives, onOpenChange, onFallback]);

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

  return (
    <>
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
}
