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
  // Article lookup map for O(1) access by ID
  articleMap: Map<string, Article>
  getArticleById: (id: string) => Article | undefined
}

export const useAppStore = create<AppStore>((set, get) => ({
  activeTab: "home",
  setActiveTab: (tab) => set({ activeTab: tab }),
  activeCategory: "All",
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  selectedArticleId: null,
  setSelectedArticleId: (id) => set({ selectedArticleId: id }),
  articles: [],
  articleMap: new Map(),
  setArticles: (articles) => {
    // Build a lookup map for fast access
    const articleMap = new Map<string, Article>()
    articles.forEach((article) => {
      if (article.id) {
        articleMap.set(article.id, article)
      }
    })
    set({ articles, articleMap })
  },
  getArticleById: (id) => {
    const state = get()
    return state.articleMap.get(id)
  },
}))
