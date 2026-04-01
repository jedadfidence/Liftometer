"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CloneSplitPane } from "@/components/clone-split-pane";
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
        const campRes = await fetch(`/api/gads/campaigns/${campaignId}`);
        if (!campRes.ok) throw new Error("Failed to fetch campaign");
        const { campaign: fetchedCampaign } = await campRes.json();
        setCampaign(fetchedCampaign);

        const agRes = await fetch(`/api/gads/adgroups?campaignId=${campaignId}`);
        if (!agRes.ok) throw new Error("Failed to fetch ad groups");
        const { adGroups: fetchedAgs } = await agRes.json();
        setAdGroups(fetchedAgs);

        const fetchedAds: Record<string, GadsAd[]> = {};
        for (const ag of fetchedAgs) {
          const adsRes = await fetch(`/api/gads/ads?adGroupId=${ag.id}`);
          if (!adsRes.ok) throw new Error(`Failed to fetch ads for ${ag.id}`);
          const { ads } = await adsRes.json();
          fetchedAds[ag.id] = ads;
        }
        setAdsByAdGroup(fetchedAds);

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
        body: JSON.stringify({ ...draft, source_campaign_id: campaignId }),
      });
      if (!res.ok) throw new Error("Failed to create draft");
      const result = await res.json();
      toast.success(`Campaign "${result.campaign_name}" cloned successfully`);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
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
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between px-1 py-2 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Clone: {campaign.name}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[var(--color-mapped)]" />
              {mapped} mapped
            </span>
            {actionNeeded > 0 && (
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-[var(--color-action-needed)]" />
                {actionNeeded} need input
              </span>
            )}
          </div>
        </div>
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
