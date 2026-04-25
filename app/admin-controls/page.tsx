import Image from "next/image"
import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { AdminLoginForm } from "@/components/admin-controls/admin-login-form"

interface PageProps {
  searchParams: Promise<{ reason?: string }>
}

export default async function AdminControlsLoginPage({ searchParams }: PageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin-controls/dashboard")
  }

  const { reason } = await searchParams
  const sessionExpired = reason === "session-expired"

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 font-sans">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex items-center justify-center">
            <div className="relative h-12 w-12">
              <Image
                src="/images/logo.svg"
                alt="Estew"
                fill
                className="object-contain dark:invert"
                priority
              />
            </div>
          </div>
          <h1 className="font-sans text-[26px] font-semibold tracking-tight text-foreground">
            estew <span className="text-muted-foreground">/ admin</span>
          </h1>
          <p className="mt-2 font-sans text-[13px] text-muted-foreground">
            Sign in to manage Estew. Sessions last 10 minutes.
          </p>
        </div>

        {sessionExpired && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2.5 text-center font-sans text-[12px] font-medium text-foreground"
          >
            Your previous session expired. Please sign in again.
          </div>
        )}

        <AdminLoginForm />
      </div>
    </main>
  )
}
