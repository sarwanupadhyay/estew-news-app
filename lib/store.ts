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
  // Add individual article to the store (for saved articles)
  addArticle: (article: Article) => void
  // Selected article object (for saved articles that may not be in the feed)
  selectedArticle: Article | null
  setSelectedArticle: (article: Article | null) => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  activeTab: "home",
  setActiveTab: (tab) => set({ activeTab: tab }),
  activeCategory: "All",
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  selectedArticleId: null,
  setSelectedArticleId: (id) => set({ selectedArticleId: id, selectedArticle: null }),
  articles: [],
  articleMap: new Map(),
  selectedArticle: null,
  setSelectedArticle: (article) => set({ 
    selectedArticle: article, 
    selectedArticleId: article?.id || null 
  }),
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
  addArticle: (article) => {
    const state = get()
    if (!state.articleMap.has(article.id)) {
      const newMap = new Map(state.articleMap)
      newMap.set(article.id, article)
      set({ 
        articles: [...state.articles, article],
        articleMap: newMap 
      })
    }
  },
  getArticleById: (id) => {
    const state = get()
    return state.articleMap.get(id)
  },
}))
