"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Plus, Building2, Unplug, Plug, Store } from "lucide-react";

interface GadsAccountInfo { customerId: string; name: string; }
interface OaiConnectionInfo { hasToken: boolean; name?: string; maskedId?: string; }

export default function SettingsPage() {
  const [gadsAccounts, setGadsAccounts] = useState<GadsAccountInfo[]>([]);
  const [oaiConnection, setOaiConnection] = useState<OaiConnectionInfo>({ hasToken: false });
  const [loading, setLoading] = useState(true);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenNameInput, setTokenNameInput] = useState("OpenAI Ads");
  const [tokenSaving, setTokenSaving] = useState(false);

  const [gmcAccounts, setGmcAccounts] = useState<{ merchantId: string; name: string }[]>([]);
  const [oaiMcConnection, setOaiMcConnection] = useState<{ hasToken: boolean; name?: string; maskedId?: string }>({ hasToken: false });
  const [mcTokenDialogOpen, setMcTokenDialogOpen] = useState(false);
  const [mcTokenInput, setMcTokenInput] = useState("");
  const [mcTokenNameInput, setMcTokenNameInput] = useState("OpenAI Merchant Center");
  const [mcTokenSaving, setMcTokenSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [accountsRes, oaiRes, gmcRes, oaiMcRes] = await Promise.all([
        fetch("/api/gads/accounts"), fetch("/api/oai/token"),
        fetch("/api/gmc/accounts"), fetch("/api/oai-mc/token"),
      ]);
      const { accounts } = await accountsRes.json();
      const oaiData = await oaiRes.json();
      const gmcData = await gmcRes.json();
      const oaiMcData = await oaiMcRes.json();
      setGadsAccounts(accounts || []);
      setOaiConnection(oaiData);
      setGmcAccounts(gmcData.accounts || []);
      setOaiMcConnection(oaiMcData);
    } catch { toast.error("Failed to load account data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function disconnectGads(customerId: string) {
    try {
      await fetch(`/api/gads/accounts/${customerId}`, { method: "DELETE" });
      setGadsAccounts((prev) => prev.filter((a) => a.customerId !== customerId));
      toast.success("Google Ads account disconnected");
    } catch { toast.error("Failed to disconnect account"); }
  }

  async function handleOaiTokenSubmit() {
    if (!tokenInput.trim()) return;
    setTokenSaving(true);
    try {
      const res = await fetch("/api/oai/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput.trim(), name: tokenNameInput.trim() || "OpenAI Ads" }),
      });
      if (!res.ok) throw new Error();
      setTokenDialogOpen(false); setTokenInput(""); setTokenNameInput("OpenAI Ads");
      toast.success("OpenAI Ads account connected");
      fetchData();
    } catch { toast.error("Failed to save token"); }
    finally { setTokenSaving(false); }
  }

  async function disconnectOai() {
    try {
      await fetch("/api/oai/token", { method: "DELETE" });
      setOaiConnection({ hasToken: false });
      toast.success("OpenAI Ads account disconnected");
    } catch { toast.error("Failed to disconnect"); }
  }

  async function disconnectGmc(merchantId: string) {
    try {
      await fetch(`/api/gmc/accounts/${merchantId}`, { method: "DELETE" });
      setGmcAccounts((prev) => prev.filter((a) => a.merchantId !== merchantId));
      toast.success("Google Merchant Center account disconnected");
    } catch { toast.error("Failed to disconnect account"); }
  }

  async function handleOaiMcTokenSubmit() {
    if (!mcTokenInput.trim()) return;
    setMcTokenSaving(true);
    try {
      const res = await fetch("/api/oai-mc/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: mcTokenInput.trim(), name: mcTokenNameInput.trim() || "OpenAI Merchant Center" }),
      });
      if (!res.ok) throw new Error();
      setMcTokenDialogOpen(false); setMcTokenInput(""); setMcTokenNameInput("OpenAI Merchant Center");
      toast.success("OpenAI Merchant Center account connected");
      fetchData();
    } catch { toast.error("Failed to save token"); }
    finally { setMcTokenSaving(false); }
  }

  async function disconnectOaiMc() {
    try {
      await fetch("/api/oai-mc/token", { method: "DELETE" });
      setOaiMcConnection({ hasToken: false });
      toast.success("OpenAI Merchant Center account disconnected");
    } catch { toast.error("Failed to disconnect"); }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Google Ads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Google Ads</CardTitle>
            <Button size="sm" variant="outline" asChild>
              <a href="/api/gads/connect"><Plus className="mr-2 h-4 w-4" />Connect Account</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {gadsAccounts.length === 0 ? (
            <EmptyState icon={Building2} title="No Google Ads accounts" description="Connect a Google Ads account to get started."
              action={<Button size="sm" asChild><a href="/api/gads/connect">Connect Account</a></Button>} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gadsAccounts.map((account) => (
                  <TableRow key={account.customerId}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell className="font-mono text-sm">{account.customerId}</TableCell>
                    <TableCell><Badge className="bg-[var(--color-status-enabled)] text-white">Connected</Badge></TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Unplug className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect {account.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This will remove access to campaigns from this account.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => disconnectGads(account.customerId)}>Disconnect</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Google Merchant Center */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Google Merchant Center</CardTitle>
            <Button size="sm" variant="outline" asChild>
              <a href="/api/gmc/connect"><Plus className="mr-2 h-4 w-4" />Connect Account</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {gmcAccounts.length === 0 ? (
            <EmptyState icon={Store} title="No Google Merchant Center accounts" description="Connect a Google Merchant Center account to get started."
              action={<Button size="sm" asChild><a href="/api/gmc/connect">Connect Account</a></Button>} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Merchant ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gmcAccounts.map((account) => (
                  <TableRow key={account.merchantId}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell className="font-mono text-sm">{account.merchantId}</TableCell>
                    <TableCell><Badge className="bg-[var(--color-status-enabled)] text-white">Connected</Badge></TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Unplug className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect {account.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This will remove access to products from this account.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => disconnectGmc(account.merchantId)}>Disconnect</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* OpenAI Ads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">OpenAI Ads</CardTitle>
            {!oaiConnection.hasToken && (
              <Button size="sm" onClick={() => setTokenDialogOpen(true)}><Plug className="mr-2 h-4 w-4" />Connect</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {oaiConnection.hasToken ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{oaiConnection.name || "OpenAI Ads"}</TableCell>
                  <TableCell className="font-mono text-sm">{oaiConnection.maskedId}</TableCell>
                  <TableCell><Badge className="bg-[var(--color-status-enabled)] text-white">Connected</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setTokenDialogOpen(true)}>Update</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Unplug className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect OpenAI Ads?</AlertDialogTitle>
                            <AlertDialogDescription>This will remove your API token.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={disconnectOai}>Disconnect</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <EmptyState icon={Plug} title="No OpenAI Ads account" description="Connect your OpenAI Ads API token to start cloning campaigns."
              action={<Button size="sm" onClick={() => setTokenDialogOpen(true)}>Connect Account</Button>} />
          )}
        </CardContent>
      </Card>

      {/* OpenAI Merchant Center */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">OpenAI Merchant Center</CardTitle>
            {!oaiMcConnection.hasToken && (
              <Button size="sm" onClick={() => setMcTokenDialogOpen(true)}><Plug className="mr-2 h-4 w-4" />Connect</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {oaiMcConnection.hasToken ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{oaiMcConnection.name || "OpenAI Merchant Center"}</TableCell>
                  <TableCell className="font-mono text-sm">{oaiMcConnection.maskedId}</TableCell>
                  <TableCell><Badge className="bg-[var(--color-status-enabled)] text-white">Connected</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setMcTokenDialogOpen(true)}>Update</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Unplug className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect OpenAI Merchant Center?</AlertDialogTitle>
                            <AlertDialogDescription>This will remove your API token.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={disconnectOaiMc}>Disconnect</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <EmptyState icon={Store} title="No OpenAI Merchant Center account" description="Connect your OpenAI Merchant Center API token to start cloning products."
              action={<Button size="sm" onClick={() => setMcTokenDialogOpen(true)}>Connect Account</Button>} />
          )}
        </CardContent>
      </Card>

      {/* OpenAI Ads token dialog */}
      <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect OpenAI Ads Account</DialogTitle>
            <DialogDescription>Enter your OpenAI Ads API token.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="oai-name">Account Name</Label>
              <Input id="oai-name" value={tokenNameInput} onChange={(e) => setTokenNameInput(e.target.value)} placeholder="OpenAI Ads" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oai-token">API Token</Label>
              <Input id="oai-token" type="password" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="Enter your API token" onKeyDown={(e) => e.key === "Enter" && handleOaiTokenSubmit()} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleOaiTokenSubmit} disabled={tokenSaving || !tokenInput.trim()}>
              {tokenSaving ? "Saving..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OpenAI Merchant Center token dialog */}
      <Dialog open={mcTokenDialogOpen} onOpenChange={setMcTokenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect OpenAI Merchant Center Account</DialogTitle>
            <DialogDescription>Enter your OpenAI Merchant Center API token.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="oai-mc-name">Account Name</Label>
              <Input id="oai-mc-name" value={mcTokenNameInput} onChange={(e) => setMcTokenNameInput(e.target.value)} placeholder="OpenAI Merchant Center" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oai-mc-token">API Token</Label>
              <Input id="oai-mc-token" type="password" value={mcTokenInput} onChange={(e) => setMcTokenInput(e.target.value)} placeholder="Enter your API token" onKeyDown={(e) => e.key === "Enter" && handleOaiMcTokenSubmit()} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleOaiMcTokenSubmit} disabled={mcTokenSaving || !mcTokenInput.trim()}>
              {mcTokenSaving ? "Saving..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
