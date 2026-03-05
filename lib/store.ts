import { create } from "zustand"
import type { Category } from "./types"

interface AppStore {
  activeTab: "home" | "explore" | "trending" | "saved" | "profile"
  setActiveTab: (tab: AppStore["activeTab"]) => void
  activeCategory: Category | "All"
  setActiveCategory: (cat: Category | "All") => void
  savedArticleIds: string[]
  toggleSaveArticle: (id: string) => void
  selectedArticleId: string | null
  setSelectedArticleId: (id: string | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: "home",
  setActiveTab: (tab) => set({ activeTab: tab }),
  activeCategory: "All",
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  savedArticleIds: ["art-1", "art-4", "art-7"],
  toggleSaveArticle: (id) =>
    set((state) => ({
      savedArticleIds: state.savedArticleIds.includes(id)
        ? state.savedArticleIds.filter((sid) => sid !== id)
        : [...state.savedArticleIds, id],
    })),
  selectedArticleId: null,
  setSelectedArticleId: (id) => set({ selectedArticleId: id }),
}))
