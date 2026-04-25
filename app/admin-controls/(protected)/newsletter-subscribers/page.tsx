import { UsersView } from "@/components/admin-controls/users-view"

export default function NewsletterSubscribersPage() {
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Newsletter Subscribers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Users who have opted in to receive your daily newsletter via email.
        </p>
      </header>
      <UsersView defaultFilter="newsletter" hideFilters />
    </div>
  )
}
