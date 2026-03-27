import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function NavBar() {
  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/dashboard" className="text-lg font-semibold">Liftometer</Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
