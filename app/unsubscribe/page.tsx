import { UnsubscribeClient } from "@/components/newsletter/unsubscribe-client"

export const metadata = {
  title: "Unsubscribe — Estew",
  description: "Stop receiving the Estew daily newsletter.",
}

interface Props {
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const params = await searchParams
  const tokenRaw = params?.token
  const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-md">
        <UnsubscribeClient token={token || ""} />
      </div>
    </main>
  )
}
