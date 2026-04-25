import { UsersView } from "@/components/admin-controls/users-view"

export default function UsersPage() {
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All registered users on Estew. Filter by plan, onboarding status, or newsletter preference.
        </p>
      </header>
      <UsersView defaultFilter="all" />
    </div>
  )
}
