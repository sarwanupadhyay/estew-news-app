import { cookies } from "next/headers"

const ADMIN_EMAIL = "sarwanupadhyay19@gmail.com"
const ADMIN_PASSWORD = "sarwan@1908"
const SESSION_COOKIE_NAME = "estew_admin_session"
const EXPIRES_COOKIE_NAME = "estew_admin_expires_at"
const SESSION_TOKEN = "valid_admin_session_v1"

/**
 * Maximum admin session lifetime in seconds.
 * After 10 minutes the session expires and re-authentication is required,
 * even if the admin has been actively using the panel.
 */
export const SESSION_DURATION_SECONDS = 10 * 60

export function verifyAdminCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD
}

export async function setAdminSession() {
  const cookieStore = await cookies()
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000

  // The actual auth cookie — httpOnly so it can't be read by client JS.
  cookieStore.set(SESSION_COOKIE_NAME, SESSION_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  })

  // Companion cookie that exposes the expiry timestamp to the client so the
  // admin UI can show a countdown and force a clean logout exactly at expiry.
  // Contains no secrets — only the absolute expiry epoch in ms.
  cookieStore.set(EXPIRES_COOKIE_NAME, String(expiresAt), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(EXPIRES_COOKIE_NAME)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE_NAME)
  return session?.value === SESSION_TOKEN
}
