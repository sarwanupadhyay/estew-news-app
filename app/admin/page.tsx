"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { verifyAdminCredentials } from "@/lib/admin-service"
import { Lock, Mail, Eye, EyeOff } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Verify credentials
    if (verifyAdminCredentials(email, password)) {
      // Store admin session in sessionStorage
      sessionStorage.setItem("estew_admin_auth", "true")
      sessionStorage.setItem("estew_admin_email", email)
      router.push("/admin/dashboard")
    } else {
      setError("Invalid credentials. Access denied.")
    }
    
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b0f] p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 h-16 w-16">
            <Image
              src="/images/logo.svg"
              alt="Estew"
              fill
              className="object-contain dark:invert"
              priority
            />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">Estew Admin</h1>
          <p className="mt-2 text-sm text-gray-400">Secure access to the admin dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="rounded-2xl border border-white/10 bg-[#12131a] p-8">
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-center text-sm text-red-400 ring-1 ring-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-12 text-white placeholder-gray-500 outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-primary py-3.5 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Access Dashboard"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          This is a protected admin area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  )
}
