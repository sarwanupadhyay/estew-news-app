import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: number | undefined
  icon: LucideIcon
  loading?: boolean
  color?: string
  description?: string
  suffix?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  color = "text-primary",
  description,
  suffix = "",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-secondary ${color}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="font-serif text-3xl font-bold leading-none text-foreground">
        {loading ? (
          <span className="inline-block h-8 w-20 animate-shimmer rounded-md" />
        ) : (
          <>
            {(value ?? 0).toLocaleString()}
            {suffix}
          </>
        )}
      </div>
      {description && (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
