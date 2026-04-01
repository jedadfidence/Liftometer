import { AuthGuard } from "@/components/auth-guard";
import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="h-screen overflow-hidden bg-background">
        <AppSidebar />
        <main className="ml-14 h-full flex flex-col overflow-hidden">
          <div className="px-6 pt-6 pb-2 shrink-0">
            <BreadcrumbNav />
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
