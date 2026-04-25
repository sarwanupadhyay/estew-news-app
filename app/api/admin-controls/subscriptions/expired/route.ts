import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { expirePastDueProUsers } from "@/lib/subscription-expiry"

/**
 * Runs the past-due Pro subscription sweep and returns the list of users
 * whose subscriptions just expired (plus any that were previously expired).
 *
 * Called from the admin dashboard so the panel always reflects current
 * subscription health without needing a cron job.
 */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await expirePastDueProUsers()
  return NextResponse.json(result)
}
