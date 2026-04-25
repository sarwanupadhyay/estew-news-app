"use client"

import { AuthProvider } from "@/lib/auth-context"
import { NewsletterArchive } from "@/components/newsletter/newsletter-archive"

export default function NewsletterIndexPage() {
  return (
    <AuthProvider>
      <NewsletterArchive />
    </AuthProvider>
  )
}
