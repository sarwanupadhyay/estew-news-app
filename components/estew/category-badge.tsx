import type { Category } from "@/lib/types"

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  AI: { bg: "rgba(139,92,246,0.12)", text: "#8B5CF6" },
  Market: { bg: "rgba(13,148,136,0.12)", text: "#0D9488" },
  Launches: { bg: "rgba(217,119,6,0.12)", text: "#D97706" },
  Apps: { bg: "rgba(37,99,235,0.12)", text: "#2563EB" },
  Startups: { bg: "rgba(239,68,68,0.12)", text: "#EF4444" },
  Products: { bg: "rgba(236,72,153,0.12)", text: "#EC4899" },
}

export function CategoryBadge({ category }: { category: Category }) {
  const c = BADGE_COLORS[category] || { bg: "rgba(136,136,136,0.12)", text: "#888" }
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: c.bg, color: c.text }}
    >
      {category}
    </span>
  )
}
