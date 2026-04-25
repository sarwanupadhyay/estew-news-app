import { NextResponse } from "next/server"
import { verifyAdminCredentials, setAdminSession } from "@/lib/admin-auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await setAdminSession()
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
