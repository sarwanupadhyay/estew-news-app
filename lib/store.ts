import { create } from "zustand"
import type { Article, Category } from "./types"

interface AppStore {
  activeTab: "home" | "explore" | "trending" | "saved" | "profile"
  setActiveTab: (tab: AppStore["activeTab"]) => void
  activeCategory: Category | "All"
  setActiveCategory: (cat: Category | "All") => void
  savedArticleIds: string[]
  toggleSaveArticle: (id: string) => void
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
  savedArticleIds: [],
  toggleSaveArticle: (id) =>
    set((state) => ({
      savedArticleIds: state.savedArticleIds.includes(id)
        ? state.savedArticleIds.filter((sid) => sid !== id)
        : [...state.savedArticleIds, id],
    })),
  selectedArticleId: null,
  setSelectedArticleId: (id) => set({ selectedArticleId: id }),
  articles: [],
  setArticles: (articles) => set({ articles }),
}))
