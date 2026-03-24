import type { Category } from "@/lib/types"

// Minimalist badge colors - softer, cleaner
const BADGE_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  AI: { bg: "#F3E8FF", text: "#7C3AED", darkBg: "rgba(167,139,250,0.15)", darkText: "#A78BFA" },
  Market: { bg: "#CCFBF1", text: "#0D9488", darkBg: "rgba(52,211,153,0.15)", darkText: "#34D399" },
  Launches: { bg: "#FEF3C7", text: "#D97706", darkBg: "rgba(251,191,36,0.15)", darkText: "#FBBF24" },
  Apps: { bg: "#DBEAFE", text: "#2563EB", darkBg: "rgba(96,165,250,0.15)", darkText: "#60A5FA" },
  Startups: { bg: "#FFE4E6", text: "#E11D48", darkBg: "rgba(251,113,133,0.15)", darkText: "#FB7185" },
  Products: { bg: "#FCE7F3", text: "#DB2777", darkBg: "rgba(244,114,182,0.15)", darkText: "#F472B6" },
}

const DEFAULT_COLOR = { bg: "#F4F4F5", text: "#71717A", darkBg: "rgba(161,161,170,0.15)", darkText: "#A1A1AA" }

export function CategoryBadge({ category }: { category: Category }) {
  const c = BADGE_COLORS[category] || DEFAULT_COLOR
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
      style={{ 
        background: `var(--badge-bg, ${c.bg})`, 
        color: `var(--badge-text, ${c.text})`,
        // CSS custom properties for dark mode
        // @ts-ignore
        '--badge-bg': c.bg,
        '--badge-text': c.text,
      }}
    >
      <style>{`
        .dark [style*="--badge-bg"] {
          --badge-bg: ${c.darkBg} !important;
          --badge-text: ${c.darkText} !important;
        }
      `}</style>
      {category}
    </span>
  )
}
