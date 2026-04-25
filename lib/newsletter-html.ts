export interface NewsletterArticle {
  headline: string
  summary: string
  link: string
  source: string
}

export interface NewsletterSection {
  title: string
  emoji: string
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

export function buildNewsletterHtml(newsletter: Newsletter, recipientName?: string): string {
  const greeting = recipientName ? `Hi ${recipientName.split(" ")[0]},` : "Hi there,"
  const formattedDate = new Date(newsletter.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const intro = newsletter.intro
    ? `<p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#475569;">${escapeHtml(
        newsletter.intro
      )}</p>`
    : ""

  const sectionsHtml = newsletter.sections
    .filter((s) => s.articles.length > 0)
    .map(
      (section) => `
      <div style="margin-bottom:36px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #7C3AED;">
          <span style="font-size:20px;line-height:1;">${section.emoji || ""}</span>
          <h2 style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1E293B;">
            ${escapeHtml(section.title)}
          </h2>
        </div>
        ${
          section.description
            ? `<p style="margin:0 0 14px;font-size:13px;color:#64748B;font-style:italic;">${escapeHtml(
                section.description
              )}</p>`
            : ""
        }
        ${section.articles
          .map(
            (article, idx) => `
          <div style="padding:${idx === 0 ? "0" : "16px"} 0 16px;${
              idx > 0 ? "border-top:1px solid #E2E8F0;" : ""
            }">
            <a href="${escapeAttr(article.link)}" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none;">
              <h3 style="margin:0 0 8px;font-family:'Fraunces','Georgia',serif;font-size:18px;font-weight:600;line-height:1.35;color:#0F172A;">
                ${escapeHtml(article.headline)}
              </h3>
              <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#475569;">
                ${escapeHtml(article.summary)}
              </p>
              <span style="display:inline-block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#7C3AED;">
                ${escapeHtml(article.source)} →
              </span>
            </a>
          </div>`
          )
          .join("")}
      </div>`
    )
    .join("")

  const aiToolHtml = newsletter.aiToolOfDay
    ? `
    <div style="margin:32px 0;padding:24px;background:linear-gradient(135deg,#F5F3FF 0%,#EDE9FE 100%);border:1px solid #DDD6FE;border-radius:16px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7C3AED;margin-bottom:8px;">
        ✨ AI Tool of the Day
      </div>
      <h3 style="margin:0 0 8px;font-family:'Fraunces','Georgia',serif;font-size:22px;font-weight:700;color:#0F172A;">
        ${escapeHtml(newsletter.aiToolOfDay.name)}
      </h3>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#475569;">
        ${escapeHtml(newsletter.aiToolOfDay.description)}
      </p>
      <a href="${escapeAttr(newsletter.aiToolOfDay.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#7C3AED;color:#FFFFFF;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">
        Try it out →
      </a>
    </div>`
    : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(newsletter.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','DM Sans',Roboto,sans-serif;color:#0F172A;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#7C3AED;color:#FFFFFF;padding:8px 16px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
        Estew Daily
      </div>
      <p style="margin:12px 0 0;font-size:13px;color:#64748B;">${formattedDate}</p>
    </div>

    <!-- Card -->
    <div style="background:#FFFFFF;border-radius:20px;padding:32px;box-shadow:0 1px 3px rgba(15,23,42,0.06),0 1px 2px rgba(15,23,42,0.04);">

      <h1 style="margin:0 0 20px;font-family:'Fraunces','Georgia',serif;font-size:28px;font-weight:700;line-height:1.2;color:#0F172A;letter-spacing:-0.01em;">
        ${escapeHtml(newsletter.subject)}
      </h1>

      <p style="margin:0 0 8px;font-size:15px;color:#1E293B;">
        ${greeting}
      </p>

      ${intro}

      ${sectionsHtml}

      ${aiToolHtml}

      <!-- CTA -->
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #E2E8F0;text-align:center;">
        <a href="https://estew.app" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#0F172A;color:#FFFFFF;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">
          Read more on Estew
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;font-size:12px;color:#94A3B8;line-height:1.6;">
      <p style="margin:0;">You're receiving this because you subscribed to Estew Daily.</p>
      <p style="margin:6px 0 0;">
        <a href="https://estew.app/profile" style="color:#7C3AED;text-decoration:none;">Manage preferences</a>
        &nbsp;·&nbsp;
        <a href="https://estew.app" style="color:#7C3AED;text-decoration:none;">Visit Estew</a>
      </p>
    </div>

  </div>
</body>
</html>`
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function escapeAttr(text: string): string {
  return escapeHtml(text)
}
