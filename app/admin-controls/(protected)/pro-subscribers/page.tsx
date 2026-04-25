import { UsersView } from "@/components/admin-controls/users-view"

export default function ProSubscribersPage() {
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Pro Subscribers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Active premium members of the Estew Pro plan.
        </p>
      </header>
      <UsersView defaultFilter="pro" hideFilters />
    </div>
  )
}
