"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { AlertCircle, Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CampaignTable } from "@/components/campaign-table";
import { EmptyState } from "@/components/empty-state";
import type { GadsCampaign } from "@/lib/types/gads";

type StatusFilter = "ALL" | "ENABLED" | "PAUSED" | "REMOVED";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<GadsCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/gads/campaigns");
        if (!res.ok) throw new Error(`Failed to fetch campaigns (${res.status})`);
        const data = await res.json();
        if (!cancelled) setCampaigns(data.campaigns ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          toast.error("Failed to load campaigns");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { ALL: campaigns.length, ENABLED: 0, PAUSED: 0, REMOVED: 0 };
    for (const c of campaigns) {
      if (c.status === "ENABLED") counts.ENABLED++;
      else if (c.status === "PAUSED") counts.PAUSED++;
      else if (c.status === "REMOVED") counts.REMOVED++;
    }
    return counts;
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    if (statusFilter === "ALL") return campaigns;
    return campaigns.filter((c) => c.status === statusFilter);
  }, [campaigns, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <Skeleton className="h-10 w-96" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <EmptyState icon={AlertCircle} title="Failed to load campaigns" description={error} />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <EmptyState
          icon={Megaphone}
          title="No campaigns found"
          description="Connect a Google Ads account to see your campaigns here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <TabsList>
          <TabsTrigger value="ALL">
            All <Badge variant="secondary" className="ml-1.5">{statusCounts.ALL}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ENABLED">
            Enabled <Badge variant="secondary" className="ml-1.5">{statusCounts.ENABLED}</Badge>
          </TabsTrigger>
          <TabsTrigger value="PAUSED">
            Paused <Badge variant="secondary" className="ml-1.5">{statusCounts.PAUSED}</Badge>
          </TabsTrigger>
          <TabsTrigger value="REMOVED">
            Removed <Badge variant="secondary" className="ml-1.5">{statusCounts.REMOVED}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <CampaignTable campaigns={filteredCampaigns} />
    </div>
  );
}
