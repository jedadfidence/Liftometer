"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Megaphone, Activity, CheckCircle2, Plus, Copy, Building2,
} from "lucide-react";
import type { GadsCampaign } from "@/lib/types/gads";
import type { ActivityEntry } from "@/lib/tokens";

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<GadsCampaign[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [accounts, setAccounts] = useState<{ customerId: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [campRes, actRes, accRes] = await Promise.all([
          fetch("/api/gads/campaigns"),
          fetch("/api/activity"),
          fetch("/api/gads/accounts"),
        ]);
        const campData = await campRes.json();
        const actData = await actRes.json();
        const accData = await accRes.json();
        setCampaigns(campData.campaigns ?? []);
        setActivity(actData.activity ?? []);
        setAccounts(accData.accounts ?? []);
      } catch {
        // Dashboard degrades gracefully
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid gap-4 grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  const enabledCount = campaigns.filter((c) => c.status === "ENABLED").length;
  const clonedCount = activity.filter((a) => a.action === "cloned").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[var(--color-status-enabled)]" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Active</p>
                <p className="text-2xl font-bold">{enabledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Copy className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Cloned to OAI</p>
                <p className="text-2xl font-bold">{clonedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard/campaigns">
            <Copy className="mr-2 h-4 w-4" />
            Clone a Campaign
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <a href="/api/gads/connect">
            <Plus className="mr-2 h-4 w-4" />
            Connect Account
          </a>
        </Button>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No activity yet. Clone a campaign to see it here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.slice(0, 10).map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{entry.campaignName}</TableCell>
                    <TableCell><Badge variant="secondary">{entry.action}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(entry.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Connected Accounts (compact) */}
      {accounts.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Connected:</span>
          <div className="flex gap-2 flex-wrap">
            {accounts.map((acc) => (
              <Badge key={acc.customerId} variant="secondary" className="gap-1">
                <Building2 className="h-3 w-3" />
                {acc.name}
              </Badge>
            ))}
          </div>
          <Link href="/dashboard/settings" className="text-sm text-muted-foreground hover:text-foreground underline">
            Manage
          </Link>
        </div>
      )}
    </div>
  );
}
