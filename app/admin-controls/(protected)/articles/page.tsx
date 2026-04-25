import { ArticlesView } from "@/components/admin-controls/articles-view"

export default function ArticlesPage() {
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Articles
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse all articles stored in your Firebase Firestore database.
        </p>
      </header>
      <ArticlesView />
    </div>
  )
}
