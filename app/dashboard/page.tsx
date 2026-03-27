import { auth } from "@/lib/auth";
import { getGadsAccounts } from "@/lib/tokens";
import { AccountCard } from "@/components/account-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3 } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const accounts = getGadsAccounts(session!.user!.id!);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button asChild>
          <a href="/api/gads/connect">
            <Plus className="mr-2 h-4 w-4" />
            Connect Google Ads Account
          </a>
        </Button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No accounts connected"
          description="Connect a Google Ads account to start viewing and cloning campaigns."
          action={<Button asChild><a href="/api/gads/connect">Connect Account</a></Button>}
        />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard key={account.customerId} name={account.name} customerId={account.customerId} />
            ))}
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/campaigns">View Campaigns</Link>
          </Button>
        </>
      )}
    </div>
  );
}
