import crypto from "crypto"

// Use a stable per-project secret. We derive from the Firebase service account
// (already an env var the project has) so we don't require a new env var.
function getSecret(): string {
  return (
    process.env.UNSUBSCRIBE_SECRET ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    "estew-unsubscribe-fallback-secret"
  )
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/")
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4))
  return Buffer.from(padded + pad, "base64").toString("utf8")
}

/**
 * Sign a stateless unsubscribe token for an email address.
 * Tokens never expire — unsubscribe links should always work.
 */
export function signUnsubscribeToken(email: string): string {
  const normalized = email.toLowerCase().trim()
  const payload = base64UrlEncode(normalized)
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex")
  return `${payload}.${sig}`
}

/**
 * Verify an unsubscribe token. Returns the email if valid, null if not.
 * Uses a constant-time comparison to prevent timing attacks.
 */
export function verifyUnsubscribeToken(token: string): { email: string } | null {
  if (typeof token !== "string") return null
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return null

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex")

  let a: Buffer
  let b: Buffer
  try {
    a = Buffer.from(sig, "hex")
    b = Buffer.from(expected, "hex")
  } catch {
    return null
  }

  if (a.length === 0 || a.length !== b.length) return null
  if (!crypto.timingSafeEqual(a, b)) return null

  try {
    const email = base64UrlDecode(payload)
    if (!email.includes("@")) return null
    return { email }
  } catch {
    return null
  }
}

/** Build a full unsubscribe URL for the email. */
export function buildUnsubscribeUrl(email: string, baseUrl: string): string {
  const token = signUnsubscribeToken(email)
  // Use URLSearchParams to ensure proper encoding
  const url = new URL("/unsubscribe", baseUrl)
  url.searchParams.set("token", token)
  return url.toString()
}
