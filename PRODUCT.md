# Estew — Product & Engineering Reference

> Tech news that never sleeps. A real-time, AI-augmented technology newsroom delivered as a mobile-first PWA, an editorial email newsletter, and an authenticated web archive — all powered by a single Firestore data plane and a dedicated admin control panel.

This document is the single source of truth for what Estew is, who it serves, how every screen connects to the underlying services, and how the codebase is organised. It is intentionally exhaustive: read it once and you should be able to ship to any surface (consumer app, newsletter, admin panel, public archive) without spelunking.

---

## Table of contents

1. [Product overview](#1-product-overview)
2. [Core value propositions](#2-core-value-propositions)
3. [User-facing surfaces](#3-user-facing-surfaces)
4. [Authentication & user lifecycle](#4-authentication--user-lifecycle)
5. [Plan tiers, pricing & entitlements](#5-plan-tiers-pricing--entitlements)
6. [Content pipeline (RSS → Firestore → screen)](#6-content-pipeline-rss--firestore--screen)
7. [AI features](#7-ai-features)
8. [Newsletter system](#8-newsletter-system)
9. [Admin control panel](#9-admin-control-panel)
10. [Routing map](#10-routing-map)
11. [Data model (Firestore collections)](#11-data-model-firestore-collections)
12. [Codebase architecture](#12-codebase-architecture)
13. [Environment variables](#13-environment-variables)
14. [Security model](#14-security-model)
15. [Notable / "out-of-the-box" features](#15-notable--out-of-the-box-features)
16. [Roadmap & improvement opportunities](#16-roadmap--improvement-opportunities)

---

## 1. Product overview

**Estew** is a curated, real-time tech-news platform that aggregates stories from across the web — RSS feeds, NewsAPI, and direct partner sources — and re-presents them in a single mobile-first reading experience. Coverage spans:

- **Artificial intelligence & machine learning** — model launches, research, regulation
- **Startups & funding** — Series A through late-stage, including acquisitions
- **Markets & business** — earnings, public-co updates, market pulse
- **Hardware, robotics & infrastructure** — chips, data centres, robotics
- **Product launches** — what shipped today, what's in beta
- **Founders & company updates** — leadership moves, all-hands news

The platform has three first-class surfaces:

1. **The mobile app** (`/`) — the daily reading experience. Free + Pro tiers. Bottom-nav PWA, installable on iOS / Android.
2. **The newsletter** — a daily editorial digest, sent through Resend, archived at `/newsletter` and viewable per-issue at `/newsletter/[id]`.
3. **The admin control panel** (`/admin-controls`) — the operator surface for managing articles, users, subscriptions, AI tools of the day, newsletter generation, send-out, and system diagnostics.

All three surfaces are backed by **Firebase** (Auth + Firestore) for user state, **Upstash Redis** for ephemeral caching/rate-limiting, **OpenRouter** for AI summarisation, **Google Gemini** (direct API) for newsletter editorial generation, **Resend** for transactional + newsletter email, and **Razorpay** for ₹599/month Pro subscriptions.

---

## 2. Core value propositions

| For the reader | For the operator |
|---|---|
| One feed for every tech story that matters today | A control panel that ships newsletters in two clicks |
| AI-generated 2–3 bullet summaries on every article (Pro) | Per-article persistence in Firestore, no third-party lock-in |
| Saved articles, follow topics, reading-history calendar | Live diagnostics that surface env / DB / API issues in plain English |
| Daily editorial newsletter with one-click unsubscribe | Subscription auto-expiry + dashboard alerts for expired Pro users |
| Web archive of every newsletter at `estew.xyz/newsletter` | Free-tier OpenRouter summarisation with a 5-model fallback chain |
| Mobile-first PWA — installable, offline-tolerant | 10-minute auto-locking admin sessions for security |

---

## 3. User-facing surfaces

### 3.1 The mobile app

A single-page-style experience driven by `useAppStore` (Zustand) that swaps between five tabs via a fixed bottom navigation bar. The shell is `components/estew/app-shell.tsx`; tabs are rendered conditionally inside `homepage.tsx`.

| Tab | Component | Purpose |
|---|---|---|
| **Home** | `feed-screen.tsx` + `hero-card.tsx` + `article-card.tsx` | Headline carousel + reverse-chronological feed grouped by category tabs |
| **Explore** | `explore-screen.tsx` | Search-led discovery, source rows, browse by topic |
| **Trending** | `trending-screen.tsx` | Algorithmic top-of-day, momentum-sorted |
| **Saved** | `saved-screen.tsx` | The user's bookmarked articles (Firestore subcollection) |
| **Profile** | `profile-screen.tsx` | Account, plan & billing, newsletter, activity history, sign-out |

#### Article reading

Tapping any card opens a **bottom-sheet** (`article-detail.tsx`) with:

- Sticky top: drag-handle + always-visible close (X)
- Scrollable body: hero image, source / time / category meta, title, summary, tags, **AI summary card** (Pro only)
- Sticky bottom: **Read Full Article** (links to source) + **Save** (toggle bookmark)

The sticky header/footer pattern guarantees the close button and the primary CTA are always reachable regardless of how long the content is.

### 3.2 Onboarding

First-run users are routed through `onboarding-screen.tsx` which collects:

1. Display name + photo
2. Topic interests (drives the feed weighting)
3. Newsletter subscription opt-in

Onboarding state lives at `users/{uid}.hasOnboarded` so we never re-prompt.

### 3.3 The public newsletter archive

Authenticated route at `/newsletter` (`components/newsletter/newsletter-archive.tsx`):

- Lists newsletters from the `newsletters` Firestore collection
- Hard-cap of **30 days** server-side (no matter what the client requests)
- Client-side **10-at-a-time** pagination
- Day-range filter chip (last 7 / last 30 days)
- Each card links to `/newsletter/[id]` for the full magazine-style render

### 3.4 The newsletter detail page

`/newsletter/[id]` is a public, magazine-styled re-render of any saved newsletter. Layout matches the email exactly:

- Black masthead with the **ESTEW.** wordmark + red dot
- Red small-caps section labels (TOP STORY, AI & MACHINE LEARNING, STARTUPS & FUNDING, DEEP DIVE)
- Hero image card for the lead story, two-up grid for the second tier, list rows with thumbnails for the rest
- Sponsored-style **AI Tool of the Day** card
- Footer with Archive / View online / Unsubscribe / Privacy

### 3.5 Static / legal pages

- `/about-us`
- `/pricing`
- `/privacy-policy`
- `/terms-of-service`
- `/unsubscribe?token=…` — public, HMAC-token-validated unsubscribe confirmation page

---

## 4. Authentication & user lifecycle

Authentication is **Firebase Auth** (email/password + Google), wrapped in a single React context: `lib/auth-context.tsx`.

```
SignUp/SignIn
    ↓
onAuthStateChanged
    ↓
Load /users/{uid} doc (merge into context)
    ↓
hasOnboarded? → No → /onboarding
                Yes → /home
```

The auth context exposes:

- `user` — Firebase user object
- `profile` — Firestore `users/{uid}` document (plan, savedArticles, followedTopics, newsletter prefs, displayName, etc.)
- `usage` — daily quota counter for free-tier limits
- Methods: `signOut`, `updateDisplayName`, `updatePhotoURL`, `saveProfile`, `toggleSaveArticle`

---

## 5. Plan tiers, pricing & entitlements

| Feature | Free | Pro (₹599/month) |
|---|---|---|
| Articles per day | 20 | Unlimited |
| Search & filters | Basic | Advanced |
| Saved articles | 10 | Unlimited |
| **AI summaries on articles** | Locked | **2–3 bullet AI summary** |
| Breaking-news alerts | Standard | Priority |
| Ads | Yes | Ad-free |
| Newsletter | Standard | Extended (longer) |

### Subscription lifecycle

1. User clicks **Upgrade to Pro** in Profile → Plan & Billing
2. Razorpay checkout opens (₹599) — handled inside `profile-screen.tsx` via injected `Razorpay` script
3. On success, `subscription-service.ts → createSubscription()` writes:
   ```
   plan: "pro"
   subscriptionStatus: "active"
   subscriptionStartDate: <now>
   renewalDate: <now + 30 days>
   razorpayPaymentId: <id>
   ```
4. **30 days later**, `lib/subscription-expiry.ts → expirePastDueProUsers()` is called by either:
   - The admin dashboard banner (`expired-pro-banner.tsx`) on every render
   - The `/api/admin-controls/subscriptions/expired` endpoint
   It downgrades the user back to `plan: "free"` with `subscriptionStatus: "expired"` and surfaces the affected list to the operator.

---

## 6. Content pipeline (RSS → Firestore → screen)

Articles enter the system via **`/api/news`** (`app/api/news/route.ts`):

```
                ┌──────────────────────┐
                │   NewsAPI / RSS feeds │
                └──────────┬───────────┘
                           │
                ┌──────────▼───────────┐
                │   /api/news (cached)  │
                │   - Upstash Redis 5m  │
                └──────────┬───────────┘
                           │ persists every fetch
                ┌──────────▼─────────────┐
                │  articles collection    │
                │  (Firestore, dedupe by  │
                │  SHA-of-URL doc id)     │
                └──────┬─────────┬────────┘
                       │         │
       ┌───────────────┘         └────────────────┐
       │                                          │
┌──────▼──────┐                          ┌────────▼─────────┐
│  Mobile app  │                          │  Admin panel +   │
│  (live feed) │                          │  Newsletter gen  │
└──────────────┘                          └──────────────────┘
```

### Key files

- `app/api/news/route.ts` — fetches NewsAPI, falls back to mock data, **always persists to Firestore** via the admin SDK
- `lib/article-storage-admin.ts` — server-only batched writer; uses URL-hash IDs so re-fetches deduplicate
- `lib/article-storage.ts` — client-side, per-user save/unsave operations on `users/{uid}/saved/{articleId}`
- `lib/redis-cache.ts` — wraps Upstash Redis for the 5-minute feed cache
- `lib/use-articles.ts` — SWR hook the screens consume

### Why we persist every fetch

The admin newsletter generator and the user-facing reading list now read from the **same** `articles` collection. Persisting on every fetch gives us:

1. A historical archive (the source URL might 404 a week later)
2. A consistent set of articles for newsletter generation regardless of NewsAPI quota
3. Server-side de-duplication (URL hash as doc ID)
4. Zero extra latency for the user — persistence happens in a try/catch *after* the response is built

---

## 7. AI features

### 7.1 Article AI summary (Pro only)

Endpoint: `app/api/summarize/route.ts`. Powered by **OpenRouter free tier** with a hard-coded fallback chain.

```
1. Hash the article URL (SHA-256, prefixed with format-version "v2-bullets")
2. Look up article_summaries/{hash} in Firestore — return instantly if cached (TTL 30d)
3. Try models in order:
   - google/gemma-4-31b-it:free  (primary, requested)
   - google/gemma-3-27b-it:free
   - meta-llama/llama-3.3-70b-instruct:free
   - mistralai/mistral-7b-instruct:free
   - google/gemma-2-9b-it:free
4. On 4xx/5xx/empty response, fall through to the next model
5. Force the model output through normalizeBullets() — strips markdown, splits prose into sentences, rebuilds as exactly 2-3 "- bullet" lines
6. Persist successful summary in Firestore so the next Pro reader gets it instantly
7. If every model fails, return the literal "No summary available."
```

This means **every** Pro user reading a popular article shares one OpenRouter call across the whole user base, dramatically reducing rate-limit and quota pressure.

### 7.2 Newsletter editorial generation

Endpoint: `app/api/admin-controls/newsletter/generate/route.ts`. Uses the official `@ai-sdk/google` provider directly with `GEMINI_API_KEY` (bypassing Vercel AI Gateway and its credit-card requirement). Default model: `gemini-2.5-flash-lite`.

The flow:

1. Read the last 24 h of articles from `articles` (gracefully falls back to the most recent 30 if the day was sparse)
2. (Optional) Look up the selected `ai_tools/{id}` to attach as Tool of the Day
3. Send a structured-output prompt to Gemini → returns `{ subject, intro, sections[].articles[] }`
4. **Re-attach original images** by mapping each generated article back to its source row in Firestore (prevents image-URL hallucination)
5. Save the result to the `newsletters` collection so it appears in the saved-list and at `/newsletter/[id]`

---

## 8. Newsletter system

### 8.1 Generate (admin)

Admin opens `/admin-controls/newsletter`:

- **AI Tools section** at the top — manage the `ai_tools` Firestore collection (add / edit / delete name + URL + description + image URL)
- Pick (or skip) an AI Tool of the Day from a dropdown
- Click **Generate Newsletter** → calls `/api/admin-controls/newsletter/generate`
- The active draft renders below in `newsletter-preview.tsx` (mirrors the email design)
- The saved-newsletters list at the bottom shows everything previously generated

### 8.2 Send (admin)

Admin opens the **Send Dialog** (`send-dialog.tsx`):

- Choose audience: All / Newsletter subscribers / Pro / a single test email
- Click Send → `/api/admin-controls/newsletter/send`

The send route:

1. Resolves the recipient list from Firestore (`users` collection, filtered by audience)
2. Loads the global `unsubscribed_emails` collection and filters them out across **every** audience
3. Generates a per-recipient HMAC unsubscribe URL (`lib/unsubscribe-token.ts`)
4. Builds the magazine-style HTML (`lib/newsletter-html.ts`) with the recipient's tokenised unsubscribe link + `View online` link to `/newsletter/[id]`
5. Sends sequentially via Resend at ≤2 req/sec with `From: "Estew <…>"` (always)
6. Adds RFC 8058 `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers so Gmail's native one-click unsubscribe works

### 8.3 Unsubscribe

- `app/api/newsletter/unsubscribe/route.ts` accepts both GET (browser link) and POST (Gmail one-click) with an HMAC-signed token
- Sets `users/{uid}.newsletterSubscribed = false` and adds the email to `unsubscribed_emails`
- The `/unsubscribe` page renders a confirmation client component

### 8.4 Public archive

- `/newsletter` — authenticated list, last 30 days, 10-per-page
- `/newsletter/[id]` — public detail page (so "View online" links from the email always work, even if the recipient isn't logged in)
- All newsletter doc fields are sanitized server-side before crossing the React Server Component → Client Component boundary (Firestore Timestamp objects are converted to ISO strings, missing fields are coerced to safe primitives)

---

## 9. Admin control panel

Mounted under `/admin-controls`. Authenticated by a **separate** session from the user app — operators sign in with environment-set credentials (`ADMIN_EMAIL` + `ADMIN_PASSWORD`), get an httpOnly cookie that **expires in 10 minutes**, and are auto-logged-out client-side by `admin-session-guard.tsx` (which shows a live `m:ss` countdown chip in the bottom-right and turns red in the last 60 s).

### 9.1 Pages

| Page | Purpose |
|---|---|
| `/admin-controls` | Login |
| `/admin-controls/dashboard` | KPI grid (users, articles, newsletter sends), expired-Pro banner, system-status banner |
| `/admin-controls/articles` | Browse + search every persisted article |
| `/admin-controls/users` | Search, filter (All / Onboarded / Pro / Free / **Expired Pro** / Newsletter), per-user detail dialog with subscription management |
| `/admin-controls/newsletter` | AI Tools manager → generate → preview → send dialog → saved-list |
| `/admin-controls/newsletter-subscribers` | List of opt-in newsletter subscribers |
| `/admin-controls/pro-subscribers` | List of active Pro users + revenue summary |
| `/admin-controls/diagnostics` | Live health check across Firebase Admin, Firestore, Gemini, Resend, Razorpay, admin auth |

### 9.2 Diagnostics page

`components/admin-controls/diagnostics-view.tsx` calls `/api/admin-controls/diagnostics` and runs ~7 categories of checks:

- Firebase Admin SDK init (key parsed, app initialised)
- Firebase client config env vars
- Firestore connectivity + per-collection counts (`users`, `articles`, `newsletter_sends`, `newsletters`, `ai_tools`)
- Article freshness (last published timestamp)
- AI Gateway / Gemini key presence
- Resend (API key + verified sender domain)
- Razorpay key presence
- Admin auth env vars

For every failure or warning the page shows the exact error message and a precise fix instruction. **Re-run checks** is one click.

### 9.3 Subscription management

In the user detail dialog (`user-detail-dialog.tsx`):

- **Activate Pro** — for free users, set N days
- **Extend Pro** — adds days; if current renewalDate is in the future, extension stacks on top of it
- **Cancel Pro** — confirmation dialog → immediate downgrade

All write through `/api/admin-controls/users/[uid]/subscription` which uses the Admin SDK so RLS is bypassed.

### 9.4 Visual identity

The admin panel uses the **same** font system as the consumer app — **Fraunces** (serif, used for hero headlines + section titles) and **DM Sans** (sans, body + UI). The Estew logo replaces the placeholder "E" tile in the sidebar header, the mobile top bar, and the login screen. `dark:invert` is applied so the logo is legible on the dark theme.

---

## 10. Routing map

```
app/
├── page.tsx                                  → Mobile app (homepage + bottom nav)
├── about-us/page.tsx
├── pricing/page.tsx
├── privacy-policy/page.tsx
├── terms-of-service/page.tsx
├── unsubscribe/page.tsx                      → Token-validated unsubscribe confirm
│
├── newsletter/
│   ├── page.tsx                              → Authenticated archive
│   └── [id]/page.tsx                         → Public per-issue magazine page
│
├── admin-controls/
│   ├── page.tsx                              → Admin login
│   └── (protected)/
│       ├── layout.tsx                        → Auth gate + sidebar + session guard
│       ├── dashboard/page.tsx
│       ├── articles/page.tsx
│       ├── users/page.tsx
│       ├── newsletter/page.tsx
│       ├── newsletter-subscribers/page.tsx
│       ├── pro-subscribers/page.tsx
│       └── diagnostics/page.tsx
│
└── api/
    ├── news/route.ts                         → Fetch + persist articles
    ├── search/route.ts
    ├── summarize/route.ts                    → OpenRouter article summary (Pro)
    ├── newsletter/
    │   ├── route.ts
    │   ├── send/route.ts
    │   ├── list/route.ts                     → Public list (≤30d, ≤30 items)
    │   ├── [id]/route.ts                     → Public single newsletter
    │   └── unsubscribe/route.ts              → HMAC-token unsubscribe
    ├── cron/
    │   ├── newsletter/route.ts               → Scheduled daily send
    │   └── newsletter-test/route.ts
    └── admin-controls/
        ├── login/route.ts
        ├── logout/route.ts
        ├── status/route.ts
        ├── stats/route.ts
        ├── diagnostics/route.ts
        ├── articles/route.ts
        ├── users/route.ts
        ├── users/[uid]/subscription/route.ts
        ├── ai-tools/route.ts
        ├── ai-tools/[id]/route.ts
        ├── subscriptions/expired/route.ts
        ├── newsletter/generate/route.ts
        ├── newsletter/send/route.ts
        ├── newsletter/list/route.ts
        ├── newsletter/[id]/route.ts
        └── newsletter/history/route.ts
```

---

## 11. Data model (Firestore collections)

| Collection | Doc shape (key fields) |
|---|---|
| `users/{uid}` | email, displayName, photoURL, plan ("free" / "pro"), subscriptionStatus, renewalDate, savedArticles[], followedTopics[], newsletterSubscribed, hasOnboarded, dailyUsage |
| `users/{uid}/saved/{articleId}` | Full article snapshot (so saved articles survive even if source 404s) |
| `users/{uid}/activity/{id}` | type, articleId, articleTitle, articleSource, articleCategory, createdAt — drives the calendar history view |
| `articles/{hash}` | title, summary, originalUrl, sourceName, category, publishedAt, imageUrl, tags |
| `article_summaries/{hash}` | aiSummary, model, title, url, cachedAt — 30-day TTL |
| `newsletters/{id}` | date, subject, intro, sections[].articles[], aiToolOfDay, createdAt, articleCount, aiToolId |
| `newsletter_sends/{id}` | newsletterId, audience, sent, failed, errors[], sentAt |
| `ai_tools/{id}` | name, url, description, imageUrl, createdAt |
| `unsubscribed_emails/{auto}` | email, unsubscribedAt |

---

## 12. Codebase architecture

### 12.1 High-level layout

```
app/                       Next.js 16 App Router (pages + route handlers)
components/
├── estew/                Consumer-app screens (feed, article-detail, profile, …)
├── admin-controls/       Admin-panel screens & dialogs
├── newsletter/           Public newsletter archive + reader + unsubscribe
├── theme-provider.tsx    next-themes wrapper
└── ui/                   shadcn/ui primitives (button, dialog, input, …)
lib/                       All business logic and integrations
public/
├── favicon.svg           Theme-aware (prefers-color-scheme) favicon
└── images/logo.{png,svg} Brand mark
scripts/                   Migration / one-off SQL or seed scripts (when needed)
```

### 12.2 Modular boundaries

The codebase is organised so each integration has **exactly one module** that owns it:

| Module | Owns |
|---|---|
| `lib/firebase.ts` | Client-side Firebase Auth + Firestore initialisation |
| `lib/firebase-admin.ts` | Server-side Admin SDK init (singleton) + init-error reporting |
| `lib/auth-context.tsx` | The single source of truth for user + profile state |
| `lib/store.ts` | Zustand store for ephemeral UI state (active tab, selected article, etc.) |
| `lib/article-storage.ts` | Client save/unsave of articles |
| `lib/article-storage-admin.ts` | Server-side batched article persistence |
| `lib/use-articles.ts` | SWR hooks (feed + AI summary) |
| `lib/subscription-service.ts` | Razorpay → Firestore on-purchase write |
| `lib/subscription-expiry.ts` | 30-day auto-expiry sweep |
| `lib/newsletter-html.ts` | Single source of truth for the email + web magazine HTML |
| `lib/unsubscribe-token.ts` | HMAC sign / verify for unsubscribe URLs |
| `lib/email-service.ts` | Resend wrapper (single instance, dev-mode logging) |
| `lib/redis-cache.ts` | Upstash Redis wrapper for feed caching |
| `lib/rate-limiter.ts` | Per-user / per-IP rate limiting |
| `lib/admin-auth.ts` | Admin session cookie set/get/clear (10-min TTL) |
| `lib/activity-service.ts` | Read activity history with pagination + per-day grouping |

### 12.3 Conventions

- **Server-only code** never imports from `lib/firebase.ts`; it imports from `lib/firebase-admin.ts`.
- **Client components** never import from `lib/firebase-admin.ts`.
- **Every API route handler** that touches admin data first calls `isAdminAuthenticated()` and returns 401 on failure.
- **Every Firestore Timestamp** crossing an RSC → Client Component boundary is normalised to a plain ISO string (Timestamps don't serialise).
- **Every email recipient** gets a per-recipient HMAC unsubscribe URL, never a shared one.
- **Every external API call** is wrapped in try/catch with `console.error("[v0] …")` for traceability.

---

## 13. Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Client | Firebase client SDK |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Server | Firebase Admin SDK (full JSON) |
| `NEXT_PUBLIC_SITE_URL` | Both | Used for absolute unsubscribe + view-online URLs |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Server | Admin panel credentials |
| `UNSUBSCRIBE_TOKEN_SECRET` | Server | HMAC signing key for unsubscribe URLs |
| `OPENROUTER_API_KEY` | Server | Article summary chain |
| `SUMMARY_MODEL` *(optional)* | Server | Override the primary summary model |
| `GEMINI_API_KEY` | Server | Newsletter editorial generation |
| `RESEND_API_KEY` | Server | All email sending |
| `RESEND_FROM_EMAIL` | Server | Sender email (display name is forced to "Estew") |
| `NEWS_API_KEY` | Server | NewsAPI for live feed |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Server | Feed cache + rate limit |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Both | Pro subscription checkout |

---

## 14. Security model

1. **Admin session** is a 10-minute httpOnly cookie. A non-httpOnly companion cookie (`estew_admin_expires_at`) drives the client-side countdown and force-logout. Re-authentication is required after every 10-minute window.
2. **Firebase Admin SDK** is used for all server-side Firestore reads and writes — RLS is enforced at the Firestore rules layer for client-direct operations only.
3. **Unsubscribe URLs** are HMAC-signed (`UNSUBSCRIBE_TOKEN_SECRET`) and embed only the email address — they cannot be forged.
4. **`From:` header** is always forced to `Estew <…>` regardless of how `RESEND_FROM_EMAIL` is formatted, preventing accidental impersonation if someone reuses the env var with a different display name.
5. **Diagnostics page** is admin-only, surfaces the *presence* of secrets (boolean) but never the values.
6. **Rate limiting** (`lib/rate-limiter.ts`) is enforced on summary, search, and feed endpoints to prevent abuse.

---

## 15. Notable / "out-of-the-box" features

- **Theme-adaptive favicon.** A single SVG with embedded `prefers-color-scheme` media queries — the browser tab icon flips colors automatically based on the OS theme, no extra files, no JS.
- **Sticky-header bottom-sheet pattern.** Every modal / sheet in the consumer app uses `flex flex-col` with a `flex-none` sticky header, `flex-1` scrollable middle, and (where applicable) a `flex-none` sticky footer — guarantees the close button and primary CTA are *always* tappable, with `safe-area-inset-bottom` padding for notched devices.
- **Cached AI summaries.** SHA-256-of-URL document IDs in `article_summaries`, with format-versioned cache keys (`v2-bullets`) so changing the summary format auto-invalidates older entries — the second Pro user reading a popular article gets a sub-100ms response.
- **Zero-AI-Gateway newsletter generation.** Direct `@ai-sdk/google` integration with `GEMINI_API_KEY` so newsletter generation works without a credit card on the AI Gateway.
- **RFC 8058 one-click unsubscribe.** `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers so Gmail shows its native unsubscribe affordance and a single click flips the user's status server-side.
- **Image re-injection.** After Gemini drafts the newsletter, we map each generated article back to the source Firestore row by URL to inject the original `imageUrl` — Gemini stays focused on prose, no hallucinated image URLs.
- **Auto-expiring Pro subs with operator surfacing.** `expirePastDueProUsers()` runs on every dashboard load, downgrades any Pro whose `renewalDate` is in the past, and surfaces them in a yellow dashboard banner with a deep-link to the pre-filtered Users view.
- **Persistent article archive.** Every NewsAPI fetch writes to Firestore via batched admin writes with URL-hash IDs — natural deduplication, full historical recall, and zero extra latency for the user.
- **Diagnostics page.** Live, plain-English health check that admins can re-run with one click — no more "why isn't the newsletter sending" mystery.
- **10-minute admin session with live countdown.** Visible `m:ss` chip in the corner that turns red in the last minute and force-logs-out at zero — combines aggressive security with user-friendly feedback.

---

## 16. Roadmap & improvement opportunities

### Short-term

- **Push notifications** for breaking-news alerts (already a Pro feature in the pricing page; needs a service-worker + FCM wiring)
- **In-app newsletter reader** that reuses `<NewsletterReader>` inside the bottom-nav so users don't need a separate web page
- **Per-section quiet hours** (mute all Markets news after 8 PM, etc.)
- **Followed-topic-driven feed weighting** — currently flat reverse-chronological; surface a rank score that boosts followed-topic articles
- **Pro-trial flow** — give free users a 7-day Pro trial without payment to drive conversion
- **Offline cache** of saved articles via the service worker so the Saved tab works on the subway

### Medium-term

- **Multiple newsletter editions** (AI-only, Startup-only) with independent subscribe states
- **RSS-feed self-service for sources** — admin pastes a feed URL, system polls + ingests automatically
- **Article-level analytics** (read rate, click-through to source, save rate) to drive editorial decisions
- **Search relevance** — currently keyword-only; move to embedding-based semantic search using the existing OpenRouter relationship
- **Dark/light theme toggle** in the consumer app (the system-wide is already supported via next-themes; just needs UI exposure)

### Architectural

- **Cron-driven newsletter ingestion** — replace on-demand `/api/news` persistence with a scheduled poll so articles are always fresh in Firestore even when no user opens the app
- **Server-side rendering of the feed** with cache components (Next.js 16 `"use cache"`) for sub-second TTFB
- **Replace mock data fallback** in `/api/news` with multi-source RSS aggregation so we're never single-sourced on NewsAPI

---

## Glossary

- **Bottom sheet** — the iOS-style modal that slides up from the bottom of the screen (used for article detail, plan & billing, newsletter settings, activity history).
- **Drag handle** — the small horizontal grey pill at the top of every bottom sheet, indicating it's swipeable (visual only — actual swipe is a roadmap item).
- **Press-effect** — a Tailwind utility class that gives buttons a subtle scale-down on tap.
- **Sticky header / footer** — `position: relative` inside a `flex-col` container with the middle section taking `flex: 1` — a pattern we use everywhere a modal has scrolling content.
- **Tier** — Free vs Pro. Drives every feature gate in the codebase via `profile?.plan === "pro"`.

---

*Last updated: this document is regenerated whenever a major surface or system changes. Keep it as the canonical onboarding doc for engineers, designers, and operators joining the Estew team.*
