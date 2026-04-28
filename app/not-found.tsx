import { NotFoundContent } from "@/components/estew/not-found-content"

// Server component: keeps the metadata export (which can't live in a
// "use client" file) and delegates rendering to NotFoundContent, which
// auth-branches between the mobile-app shell and the marketing shell.
export const metadata = {
  title: "Story not found · Estew",
  description:
    "The page you're looking for isn't in today's briefing. It may have moved, expired, or never existed.",
}

export default function NotFound() {
  return <NotFoundContent />
}
