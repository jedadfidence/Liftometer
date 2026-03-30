"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/empty-state";
import { Plus, Building2, Unplug, Plug } from "lucide-react";

interface GadsAccountInfo {
  customerId: string;
  name: string;
}

interface OaiConnectionInfo {
  hasToken: boolean;
  name?: string;
  maskedId?: string;
}

export default function SettingsPage() {
  const [gadsAccounts, setGadsAccounts] = useState<GadsAccountInfo[]>([]);
  const [oaiConnection, setOaiConnection] = useState<OaiConnectionInfo>({
    hasToken: false,
  });
  const [loading, setLoading] = useState(true);

  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenNameInput, setTokenNameInput] = useState("OpenAI Ads");
  const [tokenSaving, setTokenSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [accountsRes, oaiRes] = await Promise.all([
        fetch("/api/gads/accounts"),
        fetch("/api/oai/token"),
      ]);
      const { accounts } = await accountsRes.json();
      const oaiData = await oaiRes.json();
      setGadsAccounts(accounts || []);
      setOaiConnection(oaiData);
    } catch {
      toast.error("Failed to load account data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function disconnectGads(customerId: string) {
    try {
      await fetch(`/api/gads/accounts/${customerId}`, { method: "DELETE" });
      setGadsAccounts((prev) =>
        prev.filter((a) => a.customerId !== customerId),
      );
      toast.success("Google Ads account disconnected");
    } catch {
      toast.error("Failed to disconnect account");
    }
  }

  async function handleOaiTokenSubmit() {
    if (!tokenInput.trim()) return;
    setTokenSaving(true);
    try {
      const res = await fetch("/api/oai/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenInput.trim(),
          name: tokenNameInput.trim() || "OpenAI Ads",
        }),
      });
      if (!res.ok) throw new Error();
      setTokenDialogOpen(false);
      setTokenInput("");
      setTokenNameInput("OpenAI Ads");
      toast.success("OpenAI Ads account connected");
      fetchData();
    } catch {
      toast.error("Failed to save token");
    } finally {
      setTokenSaving(false);
    }
  }

  async function disconnectOai() {
    try {
      await fetch("/api/oai/token", { method: "DELETE" });
      setOaiConnection({ hasToken: false });
      toast.success("OpenAI Ads account disconnected");
    } catch {
      toast.error("Failed to disconnect");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-40 rounded-lg bg-muted" />
          <div className="h-40 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Google Ads Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Google Ads Accounts</CardTitle>
              <CardDescription>
                Connect your Google Ads accounts to view and clone campaigns.
              </CardDescription>
            </div>
            <Button asChild size="sm">
              <a href="/api/gads/connect">
                <Plus className="mr-2 h-4 w-4" />
                Connect
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {gadsAccounts.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Google Ads accounts"
              description="Connect a Google Ads account to get started."
              action={
                <Button asChild size="sm">
                  <a href="/api/gads/connect">Connect Account</a>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {gadsAccounts.map((account) => (
                <div
                  key={account.customerId}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{account.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {account.customerId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-[var(--color-status-enabled)] text-white">
                      Connected
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Unplug className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Disconnect {account.name}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove access to campaigns from this
                            account. You can reconnect later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => disconnectGads(account.customerId)}
                          >
                            Disconnect
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* OpenAI Ads Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">OpenAI Ads Account</CardTitle>
              <CardDescription>
                Connect your OpenAI Ads account to create campaign drafts.
              </CardDescription>
            </div>
            {!oaiConnection.hasToken && (
              <Button size="sm" onClick={() => setTokenDialogOpen(true)}>
                <Plug className="mr-2 h-4 w-4" />
                Connect
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {oaiConnection.hasToken ? (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Plug className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {oaiConnection.name || "OpenAI Ads"}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {oaiConnection.maskedId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-[var(--color-status-enabled)] text-white">
                  Connected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTokenDialogOpen(true)}
                >
                  Update
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Unplug className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Disconnect OpenAI Ads?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove your API token. You can reconnect
                        later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={disconnectOai}>
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Plug}
              title="No OpenAI Ads account"
              description="Connect your OpenAI Ads API token to start cloning campaigns."
              action={
                <Button size="sm" onClick={() => setTokenDialogOpen(true)}>
                  Connect Account
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* OAI Token Dialog */}
      <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect OpenAI Ads Account</DialogTitle>
            <DialogDescription>
              Enter your OpenAI Ads API token to enable campaign cloning.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="oai-name">Account Name</Label>
              <Input
                id="oai-name"
                value={tokenNameInput}
                onChange={(e) => setTokenNameInput(e.target.value)}
                placeholder="OpenAI Ads"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oai-token">API Token</Label>
              <Input
                id="oai-token"
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter your API token"
                onKeyDown={(e) => e.key === "Enter" && handleOaiTokenSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleOaiTokenSubmit}
              disabled={tokenSaving || !tokenInput.trim()}
            >
              {tokenSaving ? "Saving..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
