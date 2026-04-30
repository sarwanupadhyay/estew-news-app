import { NextResponse, type NextRequest } from "next/server"

/**
 * Host-based routing & access control for Estew.
 *
 * Multiple domains share a single Next.js deployment:
 *   - estew.xyz                    →  the public app + marketing site
 *   - admin.estew.xyz              →  the admin control panel (prod)
 *   - v0-estew-admin.vercel.app    →  the admin control panel (preview)
 *
 * This middleware enforces that contract at the edge so that:
 *   1. The public app can NEVER reach `/admin-controls/*` or
 *      `/api/admin-controls/*` — those return a real 404.
 *   2. The admin host serves a dedicated admin landing page at `/`
 *      (rewritten internally to `/admin-landing`) and only exposes the
 *      admin surface area + system routes — every other public page
 *      (pricing, about, privacy, terms, the user app, etc.) returns 404
 *      so there is no way to navigate from the admin host back into
 *      the consumer site.
 *   3. Local dev still works without DNS — any host that begins with
 *      `admin.` (e.g. `admin.localhost:3000`) is treated as the admin
 *      host. Plain `localhost` is treated as the main domain.
 *
 * IMPORTANT: per project rules, this is purely additive — it only adds
 * host-aware gating. It does not rename, remove, or alter any existing
 * route, API contract, or component.
 */

const ADMIN_HOST_PREFIX = "admin."

/**
 * Exact hostnames that should also be treated as the admin host even
 * though they don't start with the `admin.` prefix. This is where we
 * register Vercel preview deployments (and any future aliased preview
 * URLs) so they mirror the production admin subdomain 1:1.
 *
 * Lowercase only — the host comparison is case-insensitive.
 */
const ADMIN_EXACT_HOSTS = new Set<string>([
  "v0-estew-admin.vercel.app",
])

function isAdminHost(host: string | null): boolean {
  if (!host) return false
  const hostname = host.split(":")[0]?.toLowerCase() ?? ""
  if (hostname.startsWith(ADMIN_HOST_PREFIX)) return true
  if (ADMIN_EXACT_HOSTS.has(hostname)) return true
  return false
}

/**
 * Returns a 404 response that still renders the project's existing
 * `app/not-found.tsx` UI. We do this by rewriting to a sentinel path
 * that does not exist in the app router — Next.js renders the global
 * not-found page in that case — and explicitly setting status 404 so
 * search engines / caches see a real "Not Found".
 */
function notFoundResponse(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone()
  url.pathname = "/__route_not_available"
  return NextResponse.rewrite(url, { status: 404 })
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isAdmin = isAdminHost(req.headers.get("host"))

  // ──────────────────────────────────────────────────────────────────
  // Admin subdomain  (admin.estew.xyz)
  // ──────────────────────────────────────────────────────────────────
  if (isAdmin) {
    // Root → admin landing page (internal rewrite, URL stays "/").
    if (path === "/") {
      const rewrite = req.nextUrl.clone()
      rewrite.pathname = "/admin-landing"
      return NextResponse.rewrite(rewrite)
    }

    // Don't allow /admin-landing as a direct URL even on the admin
    // subdomain — keep it as an internal-only route so it never
    // appears in browser history / search indexes.
    if (path === "/admin-landing" || path.startsWith("/admin-landing/")) {
      return notFoundResponse(req)
    }

    // Allow only the admin surface area + system routes. Anything else
    // (pricing, about-us, privacy-policy, terms-of-service, the user
    // app, the public homepage component, etc.) is hidden from this
    // subdomain.
    const isAllowed =
      path.startsWith("/admin-controls") ||
      path.startsWith("/api/admin-controls") ||
      // System / asset routes — must always pass through.
      path.startsWith("/_next") ||
      path.startsWith("/images") ||
      path.startsWith("/favicon") ||
      path === "/robots.txt" ||
      path === "/sitemap.xml" ||
      path === "/manifest.json"

    if (!isAllowed) return notFoundResponse(req)

    return NextResponse.next()
  }

  // ──────────────────────────────────────────────────────────────────
  // Main domain  (estew.xyz)
  // ──────────────────────────────────────────────────────────────────
  // Block the admin UI on the main domain so non-admins can't
  // discover it from estew.xyz/admin-controls. Same for the admin
  // landing page — it must only ever be reachable via the admin
  // subdomain's "/" rewrite above.
  if (
    path === "/admin-controls" ||
    path.startsWith("/admin-controls/") ||
    path === "/admin-landing" ||
    path.startsWith("/admin-landing/")
  ) {
    return notFoundResponse(req)
  }

  // Block admin API routes on the main domain too. Returning a JSON
  // 404 (rather than rewriting) is correct here because API consumers
  // expect a JSON body.
  if (path.startsWith("/api/admin-controls")) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  // Skip static asset fast-paths but still run on every page + API
  // route so we can block /api/admin-controls on the main domain.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
