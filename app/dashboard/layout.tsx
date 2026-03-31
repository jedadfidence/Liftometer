import { AuthGuard } from "@/components/auth-guard";
import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <main className="ml-14 p-6">
          <BreadcrumbNav />
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
