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
