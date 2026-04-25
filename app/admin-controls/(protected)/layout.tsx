import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { AdminSidebar } from "@/components/admin-controls/admin-sidebar"
import { SystemStatusBanner } from "@/components/admin-controls/system-status-banner"
import { AdminSessionGuard } from "@/components/admin-controls/admin-session-guard"

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin-controls")
  }

  return (
    <div className="flex h-screen flex-col bg-background font-sans lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <SystemStatusBanner />
        {children}
      </main>
      <AdminSessionGuard />
    </div>
  )
}
