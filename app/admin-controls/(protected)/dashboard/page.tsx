import { DashboardOverview } from "@/components/admin-controls/dashboard-overview"

export default function DashboardPage() {
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your Estew platform metrics and activity.
        </p>
      </header>
      <DashboardOverview />
    </div>
  )
}
