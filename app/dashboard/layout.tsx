import { AuthGuard } from "@/components/auth-guard";
import { NavBar } from "@/components/nav-bar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
