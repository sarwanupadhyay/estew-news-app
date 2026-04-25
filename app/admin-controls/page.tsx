import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { AdminLoginForm } from "@/components/admin-controls/admin-login-form"

export default async function AdminControlsLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin-controls/dashboard")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <span className="font-serif text-xl font-bold">E</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Admin Controls</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to manage Estew</p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  )
}
