"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, ChevronLeft, ChevronRight, Mail, FileText, ImageOff } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const PER_PAGE = 10
const FILTERS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
] as const

interface NewsletterListItem {
  id: string
  date: string
  subject: string
  intro?: string
  preview: string
  coverImage?: string | null
  articleCount: number
  sectionCount: number
  createdAt: string
}

interface ListResponse {
  newsletters: NewsletterListItem[]
  total: number
  days: number
  error?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function NewsletterArchive() {
  const { user, loading: authLoading } = useAuth()
  const [days, setDays] = useState<7 | 30>(30)
  const [page, setPage] = useState(1)

  const { data, error, isLoading } = useSWR<ListResponse>(
    user ? `/api/newsletter/list?days=${days}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  const allItems = data?.newsletters || []
  const totalPages = Math.max(1, Math.ceil(allItems.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageItems = useMemo(
    () => allItems.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE),
    [allItems, safePage],
  )

  // Loading auth state
  if (authLoading) {
    return (
      <Shell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
        </div>
      </Shell>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <Shell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Mail size={26} strokeWidth={1.5} className="text-muted-foreground" />
          </div>
          <h2 className="mt-5 font-serif text-xl font-bold tracking-tight text-foreground">
            Sign in to read the archive
          </h2>
          <p className="mt-2 max-w-sm font-sans text-sm leading-relaxed text-muted-foreground">
            The Estew newsletter archive is available to signed-in readers.
            Create a free account to access the last 30 days of issues.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Sign in
          </Link>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      {/* Filter chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-3">
        {FILTERS.map((f) => {
          const active = days === f.value
          return (
            <button
              key={f.value}
              onClick={() => {
                setDays(f.value)
                setPage(1)
              }}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 font-sans text-[12px] font-medium transition-colors ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* States */}
      {error || data?.error ? (
        <EmptyState
          title="Couldn't load newsletters"
          message={data?.error || "Please try again in a moment."}
        />
      ) : isLoading ? (
        <div className="flex flex-col gap-3 px-5 py-2">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <EmptyState
          title="No newsletters yet"
          message={
            days === 7
              ? "We haven't published any issues in the last 7 days. Try expanding your filter."
              : "No issues in the last 30 days yet. Check back soon."
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 px-5 py-1">
            {pageItems.map((item) => (
              <NewsletterRow key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3 px-5 pb-6 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 font-sans text-[12px] font-medium text-foreground transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span className="font-sans text-[12px] text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 font-sans text-[12px] font-medium text-foreground transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          <div className="px-5 pb-10 pt-2">
            <p className="font-sans text-[11px] leading-relaxed text-muted-foreground/70">
              Showing the most recent {Math.min(allItems.length, 30)} issues from
              the last {days} days. Older issues aren&apos;t kept in the archive.
            </p>
          </div>
        </>
      )}
    </Shell>
  )
}

function NewsletterRow({ item }: { item: NewsletterListItem }) {
  return (
    <Link
      href={`/newsletter/${item.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors active:scale-[0.99]"
    >
      {item.coverImage ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.coverImage}
            alt={item.subject}
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = "none"
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 backdrop-blur">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-destructive">
              ESTEW
            </span>
          </div>
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-secondary">
          <ImageOff size={28} strokeWidth={1.25} className="text-muted-foreground/50" />
        </div>
      )}

      <div className="p-4">
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-destructive">
          {formatDate(item.date)}
        </p>
        <h3 className="mt-2 line-clamp-2 font-serif text-[18px] font-bold leading-tight tracking-tight text-foreground">
          {item.subject}
        </h3>
        {item.preview && (
          <p className="mt-2 line-clamp-2 font-sans text-[13px] leading-relaxed text-muted-foreground">
            {item.preview}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 font-sans text-[11px] text-muted-foreground/80">
          <span className="inline-flex items-center gap-1">
            <FileText size={11} />
            {item.articleCount} article{item.articleCount === 1 ? "" : "s"}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>{item.sectionCount} section{item.sectionCount === 1 ? "" : "s"}</span>
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-[16/9] w-full animate-shimmer bg-secondary" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-24 animate-shimmer rounded bg-secondary" />
        <div className="h-5 w-3/4 animate-shimmer rounded bg-secondary" />
        <div className="h-4 w-full animate-shimmer rounded bg-secondary" />
      </div>
    </div>
  )
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Mail size={32} strokeWidth={1.25} className="text-muted-foreground/40" />
      <p className="mt-4 font-sans text-[15px] font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-xs font-sans text-[13px] leading-relaxed text-muted-foreground/70">
        {message}
      </p>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[428px] flex-col bg-background pb-10">
      <div
        className="flex items-center gap-2.5 border-b border-border px-5 pb-3 pt-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <Link
          href="/"
          aria-label="Back to Estew"
          className="-ml-1 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="relative h-6 w-6">
          <Image src="/images/logo.svg" alt="Estew" fill className="object-contain dark:invert" />
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">
            Newsletter
          </h1>
          <p className="font-sans text-[11px] text-muted-foreground">
            Daily AI &amp; tech briefings
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  } catch {
    return iso
  }
}
