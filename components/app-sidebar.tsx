"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/campaigns", icon: Megaphone, label: "Campaigns" },
  { href: "/dashboard/products", icon: Package, label: "Products" },
];

const BOTTOM_ITEMS = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-14 flex-col items-center border-r border-border bg-background py-4">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="mb-6 flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold"
      >
        L
      </Link>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9",
                    active && "bg-accent text-accent-foreground"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-1">
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9",
                    active && "bg-accent text-accent-foreground"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
        <ThemeToggle />
      </div>
    </aside>
  );
}
