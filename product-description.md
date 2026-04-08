# Estew - Product Description

**Tech News That Never Sleeps**

---

## Executive Summary

Estew is a modern, AI-powered tech news aggregation and curation platform designed for tech executives, founders, developers, and AI enthusiasts. The platform delivers real-time, personalized technology news across multiple categories including Artificial Intelligence, Product Launches, Startups, Market Updates, and more.

The platform combines automated news aggregation with AI-powered newsletter generation, providing users with both a real-time news feed experience and curated daily briefings delivered directly to their inbox.

---

## What Estew Is

Estew is a premium technology news platform that solves the information overload problem for busy professionals in the tech industry. Instead of sifting through dozens of news sources, Estew aggregates, categorizes, and personalizes the most important tech news in one elegant interface.

### Core Value Proposition

1. **Curated Intelligence**: AI-powered curation that highlights what matters most in tech
2. **Personalization**: Users select topics and companies to follow for a tailored experience
3. **Time-Saving**: Daily AI-generated newsletters summarize key developments
4. **Professional Focus**: Designed for decision-makers who need actionable insights, not clickbait

---

## Features

### User-Facing Features

#### 1. Personalized News Feed
- Real-time tech news aggregated from trusted sources
- Category-based filtering (AI, Market, Launches, Apps, Startups, Products)
- Hero card highlighting the top story of the moment
- Infinite scroll with lazy loading for optimal performance

#### 2. User Onboarding
- New users complete an onboarding flow to select:
  - Topics of interest (AI/ML, Startups, FinTech, etc.)
  - Companies to follow
  - Newsletter subscription preferences
- Personalization data shapes the feed experience

#### 3. Article Saving & Bookmarks
- Save articles for later reading
- Access saved articles in a dedicated "Saved" section
- Persistent storage linked to user account

#### 4. AI-Powered Article Summaries
- Quick AI-generated summaries for rapid comprehension
- Available for Pro users with enhanced features

#### 5. Search Functionality
- Full-text search across all aggregated articles
- Filter by category, date, and source

#### 6. User Profiles & Accounts
- Google OAuth and Email/Password authentication
- Profile management with avatar, display name, and preferences
- Topic and company preference management

#### 7. Subscription Management
- View subscription status, renewal date, and days remaining
- Billing history access
- Cancel or modify subscription

### Admin Features

#### 1. Admin Dashboard
- Real-time statistics:
  - Total registered users
  - Total articles in database
  - Pro subscribers count
  - Newsletter subscribers count
- Recent users and articles overview
- Quick actions for common tasks

#### 2. Newsletter Generation System
- AI-powered newsletter generation using GPT/Claude
- Seven structured sections:
  1. **Top Story** - Most significant tech development
  2. **AI Breakthroughs** - Latest AI/ML advances
  3. **Startup Radar** - Funding rounds and emerging players
  4. **Product Launches** - New products and updates
  5. **Market Pulse** - Market trends and business insights
  6. **Quick Bytes** - Rapid-fire news highlights
  7. **Developer Insight** - Tools and resources for developers
- AI Tool of the Day feature (manually curated)
- Newsletter preview and editing capabilities

#### 3. Newsletter Delivery System
- Audience targeting options:
  - All users
  - Newsletter subscribers only
  - Selected users (custom list)
- Delivery statistics tracking:
  - Total recipients
  - Delivered count
  - Failed count
  - Pending count
- Delivery history for each newsletter

#### 4. AI Tools Management
- Add, edit, and delete AI tools for newsletter features
- Track tool metadata (name, description, URL, image)

#### 5. User Management
- View all registered users
- Filter by plan type (Free/Pro)
- View user activity and preferences

#### 6. Article Management
- View all articles in database
- Filter by category and date
- Article statistics and engagement data

---

## Business Model

### Pricing Structure

#### Free Plan - ₹0/month
- Daily news feed access
- 5 topic preferences
- Save up to 10 articles
- Weekly newsletter digest

#### Pro Plan - ₹599/month (~$7 USD)
- Everything in Free, plus:
- Unlimited topic preferences
- Unlimited saved articles
- Daily AI-curated newsletter
- Ad-free experience
- Early access to new features
- Priority support

### Revenue Streams

1. **Subscription Revenue**: Monthly Pro subscriptions at ₹599/month
2. **Potential Future Revenue**:
   - Annual subscription plans (at discount)
   - Enterprise/Team plans
   - Sponsored content/partnerships

### Payment Processing

- **Payment Gateway**: Razorpay (India-focused)
- **Currency**: INR (Indian Rupees)
- **Billing Cycle**: Monthly recurring
- **Subscription Management**: Full lifecycle support (create, renew, cancel)

---

## Technical Architecture

### Technology Stack

#### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI component library |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **Framer Motion** | Animation library |
| **Radix UI** | Accessible component primitives |
| **Lucide React** | Icon library |
| **SWR** | Data fetching and caching |
| **Zustand** | State management |

#### Backend & APIs
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints |
| **Firebase Firestore** | NoSQL database |
| **Firebase Auth** | User authentication |
| **Firebase Admin SDK** | Server-side Firebase operations |
| **Upstash Redis** | Caching layer for feed optimization |
| **Resend** | Transactional email delivery |
| **NewsAPI** | External news data source |
| **OpenAI/Anthropic** | AI newsletter generation |

#### Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Hosting and deployment platform |
| **Firebase** | Database and authentication |
| **Upstash** | Serverless Redis |
| **Resend** | Email delivery service |
| **Razorpay** | Payment processing |

### Database Schema (Firebase Firestore)

#### Collections

```
users/
├── {userId}
│   ├── email: string
│   ├── displayName: string
│   ├── photoURL: string
│   ├── plan: "free" | "pro"
│   ├── topics: string[]
│   ├── companies: string[]
│   ├── savedArticles: string[]
│   ├── newsletterSubscribed: boolean
│   ├── hasOnboarded: boolean
│   ├── subscriptionStatus: string
│   ├── renewalDate: timestamp
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

articles/
├── {articleId}
│   ├── title: string
│   ├── summary: string
│   ├── originalUrl: string
│   ├── sourceName: string
│   ├── category: string
│   ├── imageUrl: string
│   ├── publishedAt: timestamp
│   └── createdAt: timestamp

newsletters/
├── {newsletterId}
│   ├── newsletterNumber: number
│   ├── subject: string
│   ├── sections: array
│   ├── rawContent: string
│   ├── aiToolOfTheDay: object
│   ├── status: string
│   ├── audienceType: string
│   ├── deliveryStats: object
│   ├── deliveryHistory: array
│   ├── generatedAt: timestamp
│   └── sentAt: timestamp

subscriptions/
├── {subscriptionId}
│   ├── userId: string
│   ├── displayName: string
│   ├── email: string
│   ├── plan: string
│   ├── status: string
│   ├── startDate: timestamp
│   ├── renewalDate: timestamp
│   ├── razorpaySubscriptionId: string
│   ├── billingHistory: array
│   └── createdAt: timestamp

subscribed_users/
├── {userId}
│   ├── displayName: string
│   ├── email: string
│   ├── subscriptionType: string
│   ├── subscriptionPlan: string
│   ├── subscriptionStatus: string
│   ├── subscribedAt: timestamp
│   ├── renewalDate: timestamp
│   ├── amountPaid: number
│   └── totalPayments: number

ai_tools/
├── {toolId}
│   ├── name: string
│   ├── description: string
│   ├── url: string
│   ├── imageUrl: string
│   └── createdAt: timestamp
```

---

## Deployment & Infrastructure

### Hosting

**Platform**: Vercel

- **Deployment Method**: Git-based continuous deployment
- **Build Command**: `next build`
- **Framework**: Next.js 16 (automatically detected)
- **Region**: Optimized for global edge network

### Domain Configuration

**Primary Domain**: `estew.app`

- DNS configured through domain registrar
- Connected to Vercel project
- SSL/TLS certificate auto-provisioned by Vercel
- HTTPS enforced on all routes

**Email Domain**: `newsletter@estew.app`
- Configured with Resend for transactional emails
- SPF, DKIM, and DMARC records set up for deliverability

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client configuration |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Admin SDK credentials |
| `UPSTASH_REDIS_REST_URL` | Redis connection URL |
| `UPSTASH_REDIS_REST_TOKEN` | Redis authentication token |
| `NEWS_API_KEY` | NewsAPI access key |
| `RESEND_API_KEY` | Email service API key |
| `OPENAI_API_KEY` | AI newsletter generation |
| `RAZORPAY_KEY_ID` | Payment gateway public key |
| `RAZORPAY_KEY_SECRET` | Payment gateway secret |

---

## Newsletter System - Deep Dive

### How Newsletters Are Generated

1. **Article Collection**
   - System queries Firebase for recent articles (last 24-48 hours)
   - Articles are categorized by topic (AI, Startups, Products, etc.)

2. **AI Processing**
   - Articles are sent to AI model (GPT-4/Claude)
   - Custom system prompt instructs AI to:
     - Select most impactful stories
     - Generate concise summaries
     - Organize into 7 structured sections
     - Maintain professional tone

3. **Section Structure**
   ```
   TOP STORY
   AI BREAKTHROUGHS
   STARTUP RADAR
   PRODUCT LAUNCHES
   MARKET PULSE
   QUICK BYTES
   DEVELOPER INSIGHT
   ```

4. **Admin Review**
   - Generated newsletter displayed in editor
   - Admin can edit sections, headlines, summaries
   - Add/modify AI Tool of the Day
   - Preview final output

### How Newsletters Are Sent

1. **Audience Selection**
   - Admin selects target audience:
     - ALL_USERS: Every registered user
     - SUBSCRIBERS: Users with `newsletterSubscribed: true`
     - SELECTED: Custom email list

2. **Email Generation**
   - HTML email template generated with:
     - Responsive design (mobile-friendly)
     - Brand styling (Estew colors, fonts)
     - Section headers with emojis
     - Article cards with source attribution
     - CTA buttons linking to estew.app

3. **Delivery Process**
   - Emails sent via Resend API
   - Batch processing for large lists
   - Delivery tracking per recipient
   - Failed deliveries logged

4. **Statistics Tracking**
   - Total recipients count
   - Successful deliveries
   - Failed deliveries
   - Delivery history maintained

---

## Security & Authentication

### User Authentication

- **Methods**:
  - Google OAuth 2.0 (one-click sign-in)
  - Email/Password (traditional)

- **Session Management**:
  - Firebase Auth tokens
  - Automatic token refresh
  - Secure session persistence

### Admin Authentication

- **Separate Admin Login**: `/admin`
- **Credentials**: Environment-configured admin email/password
- **Session**: Stored in sessionStorage with expiration
- **Protected Routes**: Admin routes check session validity

### Data Security

- Firebase Security Rules protect user data
- Server-side operations use Firebase Admin SDK
- API routes validate authentication tokens
- HTTPS enforced on all endpoints

---

## Caching Strategy

### Redis Caching (Upstash)

- **Feed Caching**: 10-minute TTL on category feeds
- **Purpose**: Reduce Firebase read operations
- **Fallback**: Fresh data fetched if Redis unavailable

### Cache Invalidation

- Automatic expiration after TTL
- Manual invalidation available for admin
- Per-category and global invalidation supported

---

## Analytics & Monitoring

### Vercel Analytics

- Page views and unique visitors
- Performance metrics (Web Vitals)
- Geographic distribution
- Device and browser breakdown

### Application Metrics

- User registration trends
- Subscription conversion rates
- Newsletter delivery statistics
- Article engagement (view counts via Redis)

---

## Future Roadmap

### Planned Features

1. **Push Notifications**: Real-time breaking news alerts
2. **Mobile App**: Native iOS/Android applications
3. **Enterprise Plans**: Team subscriptions with shared features
4. **API Access**: Developer API for news data
5. **Advanced Personalization**: ML-based recommendation engine
6. **Podcast Integration**: Audio summaries of daily briefings
7. **Community Features**: Comments, discussions, upvotes

### Technical Improvements

1. **Full-text Search**: Elasticsearch/Algolia integration
2. **Real-time Updates**: WebSocket for live news feed
3. **Offline Support**: PWA with service workers
4. **Multi-language**: i18n support for global expansion

---

## Contact Information

**Product**: Estew  
**Website**: https://estew.app  
**Support Email**: sarwanupadhyay19@gmail.com  
**Deployment**: Vercel  
**Repository**: GitHub (estew-news-app)

---

*This document provides a comprehensive overview of the Estew platform for investor presentations, technical discussions, and stakeholder communications.*

**Document Version**: 1.0  
**Last Updated**: April 2026
