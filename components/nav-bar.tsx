import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Settings, LayoutDashboard, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavBar() {
  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold">
            Liftometer
          </Link>
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/campaigns">
                <List className="mr-2 h-4 w-4" />
                Campaigns
              </Link>
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
