export type Category = "AI" | "Market" | "Launches" | "Apps" | "Startups" | "Products"

export interface Article {
  id: string
  title: string
  summary: string
  originalUrl: string
  sourceName: string
  sourceLogoUrl: string
  sourceAgencyId: string
  publishedAt: string
  fetchedAt: string
  category: Category
  tags: string[]
  isVerifiedSource: boolean
  companyId: string | null
  founderId: string | null
  imageUrl: string
  viewCount: number
}

export interface Agency {
  id: string
  name: string
  slug: string
  logoUrl: string
  websiteUrl: string
  rssUrl: string
  isTrusted: boolean
  categoryFocus: string[]
  followerCount: number
}

export interface Company {
  id: string
  name: string
  slug: string
  logoUrl: string
  description: string
  websiteUrl: string
  rssFeedUrl: string | null
  twitterHandle: string
  foundedYear: number
  category: string
  followerCount: number
}

export interface Founder {
  id: string
  name: string
  companyId: string
  title: string
  avatarUrl: string
  twitterHandle: string
  bio: string
  latestQuote: string
  latestQuoteSource: string
  followerCount: number
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  plan: "free" | "pro"
  newsletterSubscribed: boolean
  articlesRead: number
  articlesSaved: number
  topicsFollowed: number
  memberSince: string
}
