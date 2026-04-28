import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import { ErrorParticles } from "@/components/error/error-particles"
import { MarketingFooter } from "@/components/estew/marketing-footer"

export const metadata: Metadata = {
  title: "Privacy Policy - Estew",
  description: "Privacy Policy for Estew - Your daily tech news platform",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Reusable "404 Error Page Animations" particle layer (full-bleed
          fixed overlay, no layout impact, no pointer events). */}
      <ErrorParticles />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-7 w-7">
              <Image
                src="/images/logo.svg"
                alt="Estew"
                fill
                className="object-contain dark:invert"
                priority
              />
            </div>
            <span className="font-serif text-lg font-bold text-foreground">
              Est<span className="text-primary">ew</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <div className="mb-10">
          <h1 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Privacy Policy
          </h1>
          <p className="font-sans text-sm text-muted-foreground">
            Last updated: March 19, 2026
          </p>
        </div>

        <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              1. Introduction
            </h2>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              Welcome to Estew (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website at https://estew.xyz and our mobile application (collectively, the &quot;Service&quot;).
            </p>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              By accessing or using our Service, you agree to this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access or use the Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              2. Information We Collect
            </h2>

            <h3 className="mb-3 font-sans text-base font-medium text-foreground">
              2.1 Personal Information
            </h3>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              When you create an account, subscribe to our newsletter, or interact with our Service, we may collect:
            </p>
            <ul className="mb-4 list-disc pl-5 space-y-2 font-sans text-sm text-muted-foreground">
              <li>Email address</li>
              <li>Display name or username</li>
              <li>Profile information (if provided)</li>
              <li>Authentication data (securely hashed passwords)</li>
              <li>Payment information (processed securely by third-party providers)</li>
            </ul>

            <h3 className="mb-3 font-sans text-base font-medium text-foreground">
              2.2 Usage Information
            </h3>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              We automatically collect certain information when you use our Service:
            </p>
            <ul className="mb-4 list-disc pl-5 space-y-2 font-sans text-sm text-muted-foreground">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and approximate location</li>
              <li>Pages visited and features used</li>
              <li>Reading preferences and saved articles</li>
              <li>Interaction with newsletter content</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              3. How We Use Your Information
            </h2>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-sans text-sm text-muted-foreground">
              <li>To provide, maintain, and improve our Service</li>
              <li>To personalize your experience and content recommendations</li>
              <li>To send you our daily tech intelligence newsletter (if subscribed)</li>
              <li>To process transactions and manage subscriptions</li>
              <li>To respond to your comments, questions, and support requests</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              4. Information Sharing
            </h2>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-sans text-sm text-muted-foreground">
              <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our Service (e.g., email delivery, analytics, payment processing).</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              5. Data Security
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your personal information, including encryption, secure authentication, and regular security audits. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              6. Your Rights and Choices
            </h2>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              You have certain rights regarding your personal information:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-sans text-sm text-muted-foreground">
              <li><strong>Access:</strong> You can request access to your personal data.</li>
              <li><strong>Correction:</strong> You can update or correct your information through your account settings.</li>
              <li><strong>Deletion:</strong> You can request deletion of your account and associated data.</li>
              <li><strong>Opt-out:</strong> You can unsubscribe from newsletters at any time via the link in our emails.</li>
              <li><strong>Data Portability:</strong> You can request a copy of your data in a portable format.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              7. Cookies and Tracking
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience. These include essential cookies for site functionality, analytics cookies to understand usage patterns, and preference cookies to remember your settings. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              8. Children&apos;s Privacy
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              Our Service is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us so we can take appropriate action.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              9. Changes to This Policy
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              10. Contact Us
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 rounded-lg border border-border bg-card/50 p-4">
              <p className="font-sans text-sm text-foreground">
                <strong>Estew</strong><br />
                Email: sarwanupadhyay19@gmail.com<br />
                Website: https://estew.xyz
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer — shared marketing footer with full nav, branding, and
          copyright (replaces the previous minimal bar). */}
      <MarketingFooter />
    </div>
  )
}
