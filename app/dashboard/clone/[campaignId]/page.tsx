"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LevelToggle } from "@/components/level-toggle";
import { ProgressSteps } from "@/components/progress-steps";
import { CloneSummary } from "@/components/clone-summary";
import { CloneManualReview } from "@/components/clone-manual-review";
import { mapFullCampaign, countMappingResults } from "@/lib/oai/mapper";
import type {
  GadsCampaign,
  GadsAdGroup,
  GadsAd,
  OAICampaignDraft,
  OAICloneResponse,
} from "@/lib/types";
import { CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";

type CloneStep =
  | "preflight"
  | "reading"
  | "summary"
  | "manual-review"
  | "creating"
  | "success";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ClonePage() {
  const { campaignId } = useParams<{ campaignId: string }>();

  const [step, setStep] = useState<CloneStep>("preflight");
  const [includeAdGroups, setIncludeAdGroups] = useState(true);
  const [includeCreatives, setIncludeCreatives] = useState(true);
  const [draft, setDraft] = useState<OAICampaignDraft | null>(null);
  const [cloneResult, setCloneResult] = useState<OAICloneResponse | null>(null);
  const [campaign, setCampaign] = useState<GadsCampaign | null>(null);
  const [adGroups, setAdGroups] = useState<GadsAdGroup[]>([]);
  const [adsByAdGroup, setAdsByAdGroup] = useState<Record<string, GadsAd[]>>({});
  const [error, setError] = useState<string | null>(null);

  const [readingSteps, setReadingSteps] = useState<
    { label: string; status: "pending" | "active" | "complete" }[]
  >([]);

  const handleAutoMap = useCallback(async (targetStep: "summary" | "manual-review" = "summary") => {
    setError(null);
    setStep("reading");

    const steps: { label: string; status: "pending" | "active" | "complete" }[] = [
      { label: "Fetching campaign", status: "active" },
    ];
    if (includeAdGroups) steps.push({ label: "Fetching ad groups", status: "pending" });
    if (includeCreatives) steps.push({ label: "Fetching ads", status: "pending" });
    steps.push({ label: "Mapping", status: "pending" });
    setReadingSteps([...steps]);

    try {
      // Fetch campaign
      const campaignRes = await fetch(`/api/gads/campaigns/${campaignId}`);
      if (!campaignRes.ok) throw new Error("Failed to fetch campaign");
      const { campaign: fetchedCampaign } = await campaignRes.json();
      setCampaign(fetchedCampaign);

      steps[0].status = "complete";
      setReadingSteps([...steps]);
      await delay(400);

      // Fetch ad groups
      let fetchedAdGroups: GadsAdGroup[] = [];
      if (includeAdGroups) {
        const agStepIdx = steps.findIndex((s) => s.label === "Fetching ad groups");
        steps[agStepIdx].status = "active";
        setReadingSteps([...steps]);

        const agRes = await fetch(`/api/gads/adgroups?campaignId=${campaignId}`);
        if (!agRes.ok) throw new Error("Failed to fetch ad groups");
        const { adGroups: fetchedAgs } = await agRes.json();
        fetchedAdGroups = fetchedAgs;
        setAdGroups(fetchedAdGroups);

        steps[agStepIdx].status = "complete";
        setReadingSteps([...steps]);
        await delay(400);
      }

      // Fetch ads per ad group
      const fetchedAdsByAdGroup: Record<string, GadsAd[]> = {};
      if (includeCreatives && fetchedAdGroups.length > 0) {
        const adsStepIdx = steps.findIndex((s) => s.label === "Fetching ads");
        steps[adsStepIdx].status = "active";
        setReadingSteps([...steps]);

        for (const ag of fetchedAdGroups) {
          const adsRes = await fetch(`/api/gads/ads?adGroupId=${ag.id}`);
          if (!adsRes.ok) throw new Error(`Failed to fetch ads for ad group ${ag.id}`);
          const { ads } = await adsRes.json();
          fetchedAdsByAdGroup[ag.id] = ads;
          await delay(300);
        }
        setAdsByAdGroup(fetchedAdsByAdGroup);

        steps[adsStepIdx].status = "complete";
        setReadingSteps([...steps]);
        await delay(400);
      }

      // Map
      const mapStepIdx = steps.findIndex((s) => s.label === "Mapping");
      steps[mapStepIdx].status = "active";
      setReadingSteps([...steps]);
      await delay(500);

      const mapped = mapFullCampaign(
        fetchedCampaign,
        includeAdGroups ? fetchedAdGroups : [],
        includeCreatives ? fetchedAdsByAdGroup : {},
      );
      setDraft(mapped);

      steps[mapStepIdx].status = "complete";
      setReadingSteps([...steps]);
      await delay(300);

      setStep(targetStep);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStep("preflight");
    }
  }, [campaignId, includeAdGroups, includeCreatives]);

  const handleCreateDraft = useCallback(async () => {
    if (!draft) return;
    setError(null);
    setStep("creating");

    try {
      const res = await fetch("/api/oai/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Failed to create draft");
      const result: OAICloneResponse = await res.json();
      setCloneResult(result);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create draft");
      setStep("summary");
    }
  }, [draft]);

  const mappingCounts = draft ? countMappingResults(draft) : { mapped: 0, actionNeeded: 0 };

  // Preflight
  if (step === "preflight") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Clone Campaign</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What to clone</CardTitle>
            <CardDescription>
              Choose which levels to include in the clone. Campaign level is always included.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
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
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive">
            <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={() => handleAutoMap()}>Auto Map</Button>
          <Button
            variant="ghost"
            onClick={() => handleAutoMap("manual-review")}
          >
            Manual Review
          </Button>
        </div>
      </div>
    );
  }

  // Reading
  if (step === "reading") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold">Cloning Campaign...</h1>
        <Card>
          <CardContent className="py-6">
            <ProgressSteps steps={readingSteps} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Summary
  if (step === "summary" && draft) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep("preflight")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Clone Summary</h1>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <CloneSummary
          draft={draft}
          onDraftChange={setDraft}
          mappingCounts={mappingCounts}
          onCreateDraft={handleCreateDraft}
          onEditDetails={() => setStep("manual-review")}
        />
      </div>
    );
  }

  // Manual Review
  if (step === "manual-review" && draft && campaign) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep("summary")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Manual Review</h1>
        </div>

        <CloneManualReview
          draft={draft}
          campaign={campaign}
          adGroups={adGroups}
          adsByAdGroup={adsByAdGroup}
          onDraftChange={setDraft}
        />

        <div className="flex gap-3 pt-4">
          <Button onClick={handleCreateDraft}>Create Draft</Button>
          <Button variant="outline" onClick={() => setStep("summary")}>
            Back to Summary
          </Button>
        </div>
      </div>
    );
  }

  // Creating
  if (step === "creating") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold">Creating Draft...</h1>
        <Card>
          <CardContent className="py-6">
            <ProgressSteps
              steps={[
                { label: "Mapped", status: "complete" },
                { label: "Creating", status: "active" },
                { label: "Done", status: "pending" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success
  if (step === "success" && cloneResult) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold">Clone Complete</h1>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[var(--color-mapped)]" />
              <CardTitle>Draft Created</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Draft ID</span>
              <span className="font-mono">{cloneResult.draft_id}</span>
              <span className="text-muted-foreground">Campaign Name</span>
              <span>{cloneResult.campaign_name}</span>
              <span className="text-muted-foreground">Status</span>
              <span>{cloneResult.status}</span>
              <span className="text-muted-foreground">Ad Sets</span>
              <span>{cloneResult.ad_sets_count}</span>
              <span className="text-muted-foreground">Creatives</span>
              <span>{cloneResult.creatives_count}</span>
              <span className="text-muted-foreground">Created At</span>
              <span>{new Date(cloneResult.created_at).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {cloneResult.warnings.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[var(--color-action-needed)]" />
                <CardTitle>Warnings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {cloneResult.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Button asChild>
          <Link href="/dashboard/campaigns">Clone Another</Link>
        </Button>
      </div>
    );
  }

  // Fallback
  return null;
}
