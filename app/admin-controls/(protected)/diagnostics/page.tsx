import { DiagnosticsView } from "@/components/admin-controls/diagnostics-view"

export const dynamic = "force-dynamic"

export default function DiagnosticsPage() {
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Diagnostics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live health check of every dependency the admin panel relies on. Run this any time something looks wrong.
        </p>
      </header>
      <DiagnosticsView />
    </div>
  )
}
