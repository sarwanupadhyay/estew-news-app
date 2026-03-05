import { CATEGORY_COLORS } from "@/lib/mock-data"

export function CategoryBadge({ category, size = "sm" }: { category: string; size?: "sm" | "md" }) {
  const color = CATEGORY_COLORS[category] || "#6B7280"
  const px = size === "sm" ? "px-2 py-0.5" : "px-3 py-1"
  const text = size === "sm" ? "text-[10px]" : "text-[11px]"

  return (
    <span
      className={`inline-flex items-center rounded-full font-sans font-medium uppercase tracking-wider ${px} ${text}`}
      style={{ background: color, color: "#FFFFFF" }}
    >
      {category}
    </span>
  )
}
