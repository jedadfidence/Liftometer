"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignTable } from "@/components/campaign-table";
import { EmptyState } from "@/components/empty-state";
import type { GadsCampaign } from "@/lib/types/gads";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<GadsCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/gads/campaigns");
        if (!res.ok) {
          throw new Error(`Failed to fetch campaigns (${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) {
          setCampaigns(data.campaigns ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError(message);
          toast.error("Failed to load campaigns");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            View and manage your Google Ads campaigns.
          </p>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-8 w-full max-w-2xl" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            View and manage your Google Ads campaigns.
          </p>
        </div>
        <EmptyState
          icon={AlertCircle}
          title="Failed to load campaigns"
          description={error}
        />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            View and manage your Google Ads campaigns.
          </p>
        </div>
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">
          View and manage your Google Ads campaigns.
        </p>
      </div>
      <CampaignTable campaigns={campaigns} />
    </div>
  );
}
