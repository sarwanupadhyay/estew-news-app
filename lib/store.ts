import { create } from "zustand"
import type { Article, Category } from "./types"

interface AppStore {
  activeTab: "home" | "explore" | "trending" | "saved" | "profile"
  setActiveTab: (tab: AppStore["activeTab"]) => void
  activeCategory: Category | "All"
  setActiveCategory: (cat: Category | "All") => void
  selectedArticleId: string | null
  setSelectedArticleId: (id: string | null) => void
  articles: Article[]
  setArticles: (articles: Article[]) => void
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: "home",
  setActiveTab: (tab) => set({ activeTab: tab }),
  activeCategory: "All",
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  selectedArticleId: null,
  setSelectedArticleId: (id) => set({ selectedArticleId: id }),
  articles: [],
  setArticles: (articles) => set({ articles }),
}))
