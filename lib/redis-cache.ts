import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

/**
 * Redis Caching Layer for Feed Queries
 * Reduces Firestore read operations and improves response times
 */

const CACHE_TTL = 600 // 10 minutes
const FEED_CACHE_KEY_PREFIX = "feed:"

/**
 * Get cached feed or fetch fresh data
 * Cache key format: feed:{category}:{timestamp_bucket}
 */
export async function getCachedFeed(
  category: string,
  fetchFn: () => Promise<any>
): Promise<any> {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    // Redis not configured, return fresh data
    return fetchFn()
  }

  try {
    const cacheKey = `${FEED_CACHE_KEY_PREFIX}${category}`

    // Try to get from cache
    const cached = await redis.get(cacheKey)
    if (cached) {
      // Parse if it's a string (in case Redis returns stringified JSON)
      const parsedData = typeof cached === "string" ? JSON.parse(cached) : cached
      return parsedData
    }

    // Fetch fresh data
    const data = await fetchFn()

    // Store in cache (Upstash Redis handles JSON serialization automatically)
    await redis.setex(cacheKey, CACHE_TTL, data)

    return data
  } catch (error) {
    console.error("Redis caching error:", error)
    // Fallback to fresh data if Redis fails
    return fetchFn()
  }
}

/**
 * Invalidate feed cache for a category
 */
export async function invalidateFeedCache(category: string): Promise<void> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return

  try {
    const cacheKey = `${FEED_CACHE_KEY_PREFIX}${category}`
    await redis.del(cacheKey)
    console.log(`[Redis] Invalidated cache for ${cacheKey}`)
  } catch (error) {
    console.error("Error invalidating cache:", error)
  }
}

/**
 * Invalidate all feed caches
 */
export async function invalidateAllFeedCaches(): Promise<void> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return

  try {
    const categories = ["All", "AI", "Market", "Launches", "Apps", "Startups", "Products"]
    const promises = categories.map((cat) => invalidateFeedCache(cat))
    await Promise.all(promises)
    console.log("[Redis] Invalidated all feed caches")
  } catch (error) {
    console.error("Error invalidating all caches:", error)
  }
}

/**
 * Track article view count for analytics
 */
export async function incrementArticleViewCount(articleId: string): Promise<number> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return 0

  try {
    const key = `article:views:${articleId}`
    const count = await redis.incr(key)
    // Set expiry to 30 days
    await redis.expire(key, 30 * 24 * 60 * 60)
    return count
  } catch (error) {
    console.error("Error incrementing view count:", error)
    return 0
  }
}

/**
 * Get article view count
 */
export async function getArticleViewCount(articleId: string): Promise<number> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return 0

  try {
    const key = `article:views:${articleId}`
    const count = await redis.get(key)
    return (count as number) || 0
  } catch (error) {
    console.error("Error getting view count:", error)
    return 0
  }
}
