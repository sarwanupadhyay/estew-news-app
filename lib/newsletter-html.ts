/**
 * Newsletter HTML email builder.
 *
 * Editorial magazine layout inspired by ESTEW INTEL design:
 *  - Black header bar with "ESTEW INTEL" eyebrow + date, big "ESTEW." wordmark
 *    with red accent dot, and tagline.
 *  - Cream/off-white content area with red small-caps section labels.
 *  - Hero treatment for the first article: image + serif headline + body.
 *  - Two-column responsive grid for the remaining articles per section.
 *  - AI Tool of the Day callout card.
 *  - Black footer with Archive / View Online / Unsubscribe / Privacy links.
 *
 * Designed for email-client safety: tables for layout, inline styles only,
 * Georgia serif fallback when web fonts aren't available, and a media query
 * that stacks the 2-col grid on narrow screens.
 */

export interface NewsletterArticle {
  headline: string
  summary: string
  link: string
  source: string
  imageUrl?: string
}

export interface NewsletterSection {
  title: string
  emoji?: string
  description?: string
  articles: NewsletterArticle[]
}

export interface AiToolOfDay {
  name: string
  url: string
  description: string
  imageUrl?: string
}

export interface Newsletter {
  date: string
  subject: string
  intro?: string
  sections: NewsletterSection[]
  aiToolOfDay?: AiToolOfDay | null
}

export interface BuildOptions {
  /** Recipient name used to personalize the greeting. */
  recipientName?: string
  /** Per-recipient unsubscribe URL (signed token). */
  unsubscribeUrl?: string
  /** Public web URL for this newsletter (the "View online" link). */
  webUrl?: string
}

const COLOR = {
  bg: "#F5F0E6", // cream
  card: "#FFFFFF",
  ink: "#0A0A0A", // near-black for header/footer
  text: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E5E0D5",
  accent: "#ED4E2B", // red accent
}

export function buildNewsletterHtml(
  newsletter: Newsletter,
  optionsOrName?: BuildOptions | string,
): string {
  // Backwards-compatible: callers may pass just the recipient name string.
  const opts: BuildOptions =
    typeof optionsOrName === "string"
      ? { recipientName: optionsOrName }
      : optionsOrName || {}

  const formattedDate = formatDate(newsletter.date)
  const formattedDateShort = formatDateShort(newsletter.date)
  const greeting = opts.recipientName
    ? `Hi ${opts.recipientName.split(" ")[0]},`
    : "Welcome back,"

  // First section's first article becomes the hero. Everything else becomes
  // a normal grid item in its respective section.
  const firstSection = newsletter.sections.find((s) => s.articles.length > 0)
  const heroArticle = firstSection?.articles[0]
  const heroSectionTitle = firstSection?.title || "Top Story"

  const heroHtml = heroArticle
    ? renderHero(heroArticle, heroSectionTitle)
    : ""

  // Build remaining sections: skip the hero article from the first section,
  // include all articles from other sections.
  const remainingSections: NewsletterSection[] = newsletter.sections
    .map((s, idx) => {
      if (idx === 0 && firstSection) {
        return { ...s, articles: s.articles.slice(1) }
      }
      return s
    })
    .filter((s) => s.articles.length > 0)

  const sectionsHtml = remainingSections.map(renderSection).join("")

  const aiToolHtml = newsletter.aiToolOfDay
    ? renderAiTool(newsletter.aiToolOfDay)
    : ""

  const introHtml = newsletter.intro
    ? `<p style="margin:0 0 24px;font-family:Georgia,'Fraunces',serif;font-size:17px;line-height:1.6;color:${COLOR.text};font-style:italic;">${escapeHtml(
        newsletter.intro,
      )}</p>`
    : ""

  const viewOnlineLink = opts.webUrl
    ? `<a href="${escapeAttr(opts.webUrl)}" style="color:#9CA3AF;text-decoration:underline;">View online</a>`
    : ""

  const unsubscribeLink = opts.unsubscribeUrl
    ? `<a href="${escapeAttr(opts.unsubscribeUrl)}" style="color:#9CA3AF;text-decoration:underline;">Unsubscribe</a>`
    : `<a href="https://estew.xyz/profile" style="color:#9CA3AF;text-decoration:underline;">Unsubscribe</a>`

  const viewOnlineBar = opts.webUrl
    ? `<div style="text-align:center;padding:8px 16px 4px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#9CA3AF;letter-spacing:0.04em;background:${COLOR.bg};">
         Trouble viewing this email? <a href="${escapeAttr(opts.webUrl)}" style="color:${COLOR.accent};text-decoration:none;font-weight:500;">Read it on the web →</a>
       </div>`
    : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(newsletter.subject)}</title>
<style>
  /* Stack 2-col cards on narrow screens. */
  @media only screen and (max-width:600px){
    .stack{display:block !important;width:100% !important;max-width:100% !important;}
    .stack-pad{padding:0 0 24px 0 !important;}
    .hero-grid{display:block !important;}
    .hero-img,.hero-text{display:block !important;width:100% !important;max-width:100% !important;}
    .hero-text{padding:24px 0 0 0 !important;}
    .px-mob{padding-left:20px !important;padding-right:20px !important;}
    .h-display{font-size:48px !important;letter-spacing:-0.02em !important;}
    .h-hero{font-size:26px !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${COLOR.bg};">
${viewOnlineBar}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLOR.bg};">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="width:100%;max-width:640px;">

        <!-- HEADER (black bar) -->
        <tr>
          <td style="background:${COLOR.ink};padding:18px 32px 28px;" class="px-mob">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#A1A1AA;text-transform:uppercase;">ESTEW INTEL</td>
                <td align="right" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.16em;color:#A1A1AA;text-transform:uppercase;">${escapeHtml(formattedDateShort)}</td>
              </tr>
            </table>
            <h1 class="h-display" style="margin:24px 0 6px;font-family:Georgia,'Fraunces',serif;font-size:64px;line-height:1;font-weight:800;color:#FFFFFF;letter-spacing:-0.025em;">
              ESTEW<span style="color:${COLOR.accent};">.</span>
            </h1>
            <p style="margin:6px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.18em;color:#9CA3AF;text-transform:uppercase;">
              AI &amp; Technology Intelligence &middot; Daily Briefing
            </p>
          </td>
        </tr>

        <!-- Red accent rule -->
        <tr><td style="background:${COLOR.accent};line-height:0;font-size:0;height:3px;">&nbsp;</td></tr>

        <!-- CONTENT -->
        <tr>
          <td style="background:${COLOR.bg};padding:32px;" class="px-mob">

            <!-- Greeting + intro -->
            <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:${COLOR.textMuted};letter-spacing:0.02em;">
              ${escapeHtml(formattedDate)}
            </p>
            <p style="margin:0 0 18px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:${COLOR.text};">
              ${escapeHtml(greeting)}
            </p>
            ${introHtml}

            <!-- Subject line as the issue title -->
            <h2 style="margin:8px 0 28px;font-family:Georgia,'Fraunces',serif;font-size:22px;line-height:1.3;font-weight:600;color:${COLOR.text};">
              ${escapeHtml(newsletter.subject)}
            </h2>

            ${heroHtml}
            ${sectionsHtml}
            ${aiToolHtml}

            <!-- CTA bar -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:32px;">
              <tr>
                <td align="center" style="padding:24px 0 0;border-top:1px solid ${COLOR.border};">
                  <a href="https://estew.xyz" style="display:inline-block;background:${COLOR.ink};color:#FFFFFF;padding:14px 32px;border-radius:6px;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">
                    Read more on Estew
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:${COLOR.ink};padding:36px 32px;" class="px-mob">
            <h2 style="margin:0 0 8px;font-family:Georgia,'Fraunces',serif;font-size:36px;line-height:1;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;">
              ESTEW<span style="color:${COLOR.accent};">.</span>
            </h2>
            <p style="margin:0 0 24px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:1.6;color:#9CA3AF;">
              AI &amp; Technology Intelligence — Published daily for builders, founders &amp; investors.
            </p>
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.06em;color:#9CA3AF;">
              <a href="https://estew.xyz/newsletter" style="color:#9CA3AF;text-decoration:underline;">Archive</a>
              &nbsp;&middot;&nbsp;
              ${viewOnlineLink || `<a href="https://estew.xyz" style="color:#9CA3AF;text-decoration:underline;">Visit Estew</a>`}
              &nbsp;&middot;&nbsp;
              ${unsubscribeLink}
              &nbsp;&middot;&nbsp;
              <a href="https://estew.xyz/privacy" style="color:#9CA3AF;text-decoration:underline;">Privacy</a>
            </p>
            <p style="margin:18px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;color:#6B6B6B;line-height:1.6;">
              You&apos;re receiving this because you subscribed to Estew Daily. If you no longer want these emails, click Unsubscribe above and we&apos;ll remove you immediately.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

function renderHero(article: NewsletterArticle, sectionLabel: string): string {
  const imageBlock = article.imageUrl
    ? `<a href="${escapeAttr(article.link)}" style="display:block;text-decoration:none;">
         <img src="${escapeAttr(article.imageUrl)}" alt="${escapeAttr(article.headline)}" width="288" style="display:block;width:100%;max-width:288px;height:auto;border:0;outline:none;border-radius:2px;" />
       </a>`
    : `<div style="background:${COLOR.border};width:100%;height:200px;border-radius:2px;"></div>`

  return `
    <!-- Section eyebrow -->
    <p style="margin:0 0 12px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;color:${COLOR.accent};text-transform:uppercase;">
      ${escapeHtml(sectionLabel)}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 36px;background:${COLOR.card};border:1px solid ${COLOR.border};">
      <tr class="hero-grid">
        <td class="hero-img stack" valign="top" width="50%" style="padding:24px;width:50%;">
          ${imageBlock}
        </td>
        <td class="hero-text stack" valign="top" width="50%" style="padding:24px 24px 24px 0;width:50%;">
          <p style="margin:0 0 12px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;color:${COLOR.accent};text-transform:uppercase;">
            ${escapeHtml(article.source)}
          </p>
          <a href="${escapeAttr(article.link)}" style="text-decoration:none;color:inherit;">
            <h3 class="h-hero" style="margin:0 0 14px;font-family:Georgia,'Fraunces',serif;font-size:30px;line-height:1.15;font-weight:700;color:${COLOR.text};letter-spacing:-0.012em;">
              ${escapeHtml(article.headline)}
            </h3>
          </a>
          <p style="margin:0 0 20px;font-family:Georgia,'Fraunces',serif;font-size:15px;line-height:1.6;color:${COLOR.text};">
            ${escapeHtml(article.summary)}
          </p>
          <a href="${escapeAttr(article.link)}" style="display:inline-block;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;color:${COLOR.text};text-transform:uppercase;text-decoration:none;border:1px solid ${COLOR.text};padding:10px 18px;">
            Read full story →
          </a>
        </td>
      </tr>
    </table>`
}

function renderSection(section: NewsletterSection): string {
  const articles = section.articles
  const description = section.description
    ? `<p style="margin:-4px 0 18px;font-family:Georgia,'Fraunces',serif;font-size:14px;color:${COLOR.textMuted};font-style:italic;">${escapeHtml(section.description)}</p>`
    : ""

  // Render 2-up grid (stacks on mobile via .stack class).
  const cardsHtml: string[] = []
  for (let i = 0; i < articles.length; i += 2) {
    const left = articles[i]
    const right = articles[i + 1]
    cardsHtml.push(`
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px;">
        <tr>
          <td class="stack stack-pad" valign="top" width="50%" style="width:50%;padding:0 8px 0 0;">
            ${renderArticleCard(left)}
          </td>
          <td class="stack stack-pad" valign="top" width="50%" style="width:50%;padding:0 0 0 8px;">
            ${right ? renderArticleCard(right) : "&nbsp;"}
          </td>
        </tr>
      </table>`)
  }

  return `
    <div style="margin:0 0 36px;">
      <p style="margin:0 0 14px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;color:${COLOR.accent};text-transform:uppercase;border-top:1px solid ${COLOR.border};padding-top:24px;">
        ${escapeHtml(section.title)}
      </p>
      ${description}
      ${cardsHtml.join("")}
    </div>`
}

function renderArticleCard(article: NewsletterArticle): string {
  const imageBlock = article.imageUrl
    ? `<a href="${escapeAttr(article.link)}" style="display:block;text-decoration:none;">
         <img src="${escapeAttr(article.imageUrl)}" alt="${escapeAttr(article.headline)}" width="280" style="display:block;width:100%;max-width:280px;height:auto;border:0;outline:none;" />
       </a>`
    : `<div style="background:${COLOR.border};width:100%;height:140px;"></div>`

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLOR.card};border:1px solid ${COLOR.border};">
      <tr><td>${imageBlock}</td></tr>
      <tr>
        <td style="padding:16px 18px 18px;">
          <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.16em;color:${COLOR.accent};text-transform:uppercase;">
            ${escapeHtml(article.source)}
          </p>
          <a href="${escapeAttr(article.link)}" style="text-decoration:none;color:inherit;">
            <h4 style="margin:0 0 10px;font-family:Georgia,'Fraunces',serif;font-size:18px;line-height:1.25;font-weight:700;color:${COLOR.text};letter-spacing:-0.005em;">
              ${escapeHtml(article.headline)}
            </h4>
          </a>
          <p style="margin:0 0 10px;font-family:Georgia,'Fraunces',serif;font-size:14px;line-height:1.55;color:${COLOR.text};">
            ${escapeHtml(article.summary)}
          </p>
          <a href="${escapeAttr(article.link)}" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;color:${COLOR.text};text-decoration:none;text-transform:uppercase;">
            Read more →
          </a>
        </td>
      </tr>
    </table>`
}

function renderAiTool(tool: AiToolOfDay): string {
  const imageBlock = tool.imageUrl
    ? `<img src="${escapeAttr(tool.imageUrl)}" alt="${escapeAttr(tool.name)}" width="120" style="display:block;width:120px;height:120px;object-fit:cover;border:1px solid ${COLOR.border};" />`
    : ""

  return `
    <div style="margin:0 0 36px;">
      <p style="margin:0 0 14px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;color:${COLOR.accent};text-transform:uppercase;border-top:1px solid ${COLOR.border};padding-top:24px;">
        AI Tool of the Day
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLOR.card};border:1px solid ${COLOR.border};">
        <tr>
          ${imageBlock ? `<td valign="top" width="120" style="padding:18px;width:120px;" class="stack">${imageBlock}</td>` : ""}
          <td valign="top" style="padding:18px ${imageBlock ? "18px 18px 0" : "18px"};" class="stack">
            <a href="${escapeAttr(tool.url)}" style="text-decoration:none;color:inherit;">
              <h4 style="margin:0 0 10px;font-family:Georgia,'Fraunces',serif;font-size:22px;line-height:1.2;font-weight:700;color:${COLOR.text};">
                ${escapeHtml(tool.name)}
              </h4>
            </a>
            <p style="margin:0 0 14px;font-family:Georgia,'Fraunces',serif;font-size:14px;line-height:1.55;color:${COLOR.text};">
              ${escapeHtml(tool.description)}
            </p>
            <a href="${escapeAttr(tool.url)}" style="display:inline-block;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;color:#FFFFFF;background:${COLOR.ink};text-decoration:none;text-transform:uppercase;padding:10px 18px;">
              Try it →
            </a>
          </td>
        </tr>
      </table>
    </div>`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function formatDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function escapeHtml(text: string): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function escapeAttr(text: string): string {
  return escapeHtml(text)
}
