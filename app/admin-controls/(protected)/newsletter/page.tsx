import { NewsletterStudio } from "@/components/admin-controls/newsletter-studio"
import { NewsletterHistory } from "@/components/admin-controls/newsletter-history"

export default function NewsletterPage() {
  return (
    <div className="space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      <header>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Newsletter
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a curated newsletter from the last 24 hours of news, then send it to your audience.
        </p>
      </header>
      <NewsletterStudio />
      <NewsletterHistory />
    </div>
  )
}
