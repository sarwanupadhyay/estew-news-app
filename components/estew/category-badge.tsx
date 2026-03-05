import { CATEGORY_COLORS } from "@/lib/mock-data"

export function CategoryBadge({ category, size = "sm" }: { category: string; size?: "sm" | "md" }) {
  const color = CATEGORY_COLORS[category] || "#6B7280"
  const isSmall = size === "sm"

  return (
    <span
      className="inline-flex items-center font-sans font-medium uppercase"
      style={{
        background: color,
        color: "#FFFFFF",
        borderRadius: 999,
        padding: isSmall ? "2px 8px" : "3px 10px",
        fontSize: isSmall ? 10 : 11,
        letterSpacing: "0.08em",
        lineHeight: 1.5,
      }}
    >
      {category}
    </span>
  )
}
