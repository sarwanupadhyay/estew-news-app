import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Estew Admin Panel",
  description: "Admin dashboard for Estew tech news platform",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
