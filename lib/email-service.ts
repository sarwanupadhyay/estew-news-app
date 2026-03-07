"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface NewsletterArticle {
  headline: string
  summary: string
  link: string
  source: string
}

interface NewsletterSection {
  title: string
  emoji: string
  articles: NewsletterArticle[]
}

interface Newsletter {
  date: string
  subject: string
  sections: NewsletterSection[]
}

export async function sendNewsletterEmail(
  to: string,
  newsletter: Newsletter,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured")
    return { success: false, error: "Email service not configured" }
  }

  const htmlContent = generateNewsletterHTML(newsletter, userName)

  try {
    const { error } = await resend.emails.send({
      from: "Estew <newsletter@estew.app>",
      to: [to],
      subject: newsletter.subject,
      html: htmlContent,
    })

    if (error) {
      console.error("Resend error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("Email send error:", err)
    return { success: false, error: "Failed to send email" }
  }
}

function generateNewsletterHTML(newsletter: Newsletter, userName?: string): string {
  const greeting = userName ? `Hi ${userName.split(" ")[0]},` : "Hi there,"
  const formattedDate = new Date(newsletter.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const sectionsHTML = newsletter.sections
    .filter((section) => section.articles.length > 0)
    .map(
      (section) => `
      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 18px; font-weight: 700; color: #1a1b2e; margin-bottom: 16px; border-bottom: 2px solid #0066FF; padding-bottom: 8px;">
          ${section.emoji} ${section.title}
        </h2>
        ${section.articles
          .map(
            (article) => `
          <div style="margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 12px;">
            <a href="${article.link}" style="font-size: 16px; font-weight: 600; color: #1a1b2e; text-decoration: none; line-height: 1.4;">
              ${article.headline}
            </a>
            <p style="font-size: 14px; color: #4b5563; margin: 8px 0 0 0; line-height: 1.5;">
              ${article.summary}
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">
              Source: ${article.source}
            </p>
          </div>
        `
          )
          .join("")}
      </div>
    `
    )
    .join("")

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsletter.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4ff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 28px; font-weight: 800; color: #0066FF; margin: 0 0 8px 0;">ESTEW</h1>
      <p style="font-size: 14px; color: #4b5563; margin: 0;">Tech news that never sleeps</p>
      <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">${formattedDate}</p>
    </div>

    <!-- Main Content -->
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <p style="font-size: 16px; color: #1a1b2e; margin: 0 0 24px 0;">
        ${greeting}
      </p>
      <p style="font-size: 14px; color: #4b5563; margin: 0 0 32px 0; line-height: 1.6;">
        Here's your daily tech briefing - the stories that matter, curated just for you.
      </p>

      ${sectionsHTML}

      <!-- CTA -->
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <a href="https://estew.app" style="display: inline-block; background: #0066FF; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Read More on Estew
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">
        You're receiving this because you subscribed to Estew Daily.
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">
        <a href="https://estew.app/profile" style="color: #0066FF; text-decoration: none;">Manage preferences</a>
        &nbsp;|&nbsp;
        <a href="https://estew.app/unsubscribe" style="color: #0066FF; text-decoration: none;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
`
}
