import { cookies } from "next/headers"

const ADMIN_EMAIL = "sarwanupadhyay19@gmail.com"
const ADMIN_PASSWORD = "sarwan@1908"
const SESSION_COOKIE_NAME = "estew_admin_session"
const SESSION_TOKEN = "valid_admin_session_v1"

export function verifyAdminCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD
}

export async function setAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, SESSION_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE_NAME)
  return session?.value === SESSION_TOKEN
}
