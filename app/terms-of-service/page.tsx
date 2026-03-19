import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Estew",
  description: "Terms of Service for Estew - Your daily tech news platform",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
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
            Terms of Service
          </h1>
          <p className="font-sans text-sm text-muted-foreground">
            Last updated: March 19, 2026
          </p>
        </div>

        <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              Welcome to Estew! These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Estew website at https://estew.xyz, our mobile application, and any related services (collectively, the &quot;Service&quot;). By accessing or using our Service, you agree to be bound by these Terms.
            </p>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              If you do not agree to these Terms, you may not access or use the Service. We reserve the right to update or modify these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              2. Description of Service
            </h2>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              Estew is a curated tech news platform that provides:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-sans text-sm text-muted-foreground">
              <li>AI-curated daily tech news briefings</li>
              <li>Real-time news aggregation from trusted sources</li>
              <li>Personalized content based on your preferences</li>
              <li>Daily newsletter delivery with tech intelligence</li>
              <li>Premium features for subscribed members</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              3. User Accounts
            </h2>
            
            <h3 className="mb-3 font-sans text-base font-medium text-foreground">
              3.1 Registration
            </h3>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              To access certain features of our Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information updated.
            </p>

            <h3 className="mb-3 font-sans text-base font-medium text-foreground">
              3.2 Account Security
            </h3>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h3 className="mb-3 font-sans text-base font-medium text-foreground">
              3.3 Account Termination
            </h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              You may delete your account at any time through your account settings. We reserve the right to suspend or terminate accounts that violate these Terms or engage in prohibited activities.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              4. Subscription and Payment
            </h2>
            
            <h3 className="mb-3 font-sans text-base font-medium text-foreground">
              4.1 Free and Premium Tiers
            </h3>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              Estew offers both free and premium subscription tiers. Free users have access to basic features, while premium subscribers (&quot;Estew Pro&quot;) enjoy additional benefits including ad-free experience, exclusive content, and priority features.
            </p>

            <h3 className="mb-3 font-sans text-base font-medium text-foreground">
              4.2 Billing
            </h3>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              Premium subscriptions are billed on a recurring basis (monthly or annually) as selected during purchase. By subscribing, you authorize us to charge your payment method for the subscription fee plus any applicable taxes.
            </p>

            <h3 className="mb-3 font-sans text-base font-medium text-foreground">
              4.3 Cancellation and Refunds
            </h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              You may cancel your subscription at any time. Upon cancellation, you will continue to have access to premium features until the end of your current billing period. Refunds are generally not provided for partial billing periods, except as required by applicable law.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              5. Acceptable Use
            </h2>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-sans text-sm text-muted-foreground">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to our systems or other user accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated scripts or bots to access the Service</li>
              <li>Scrape, crawl, or otherwise extract content without permission</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Post or transmit malicious code or viruses</li>
              <li>Impersonate any person or entity</li>
              <li>Resell or redistribute our content without authorization</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              6. Intellectual Property
            </h2>
            
            <h3 className="mb-3 font-sans text-base font-medium text-foreground">
              6.1 Our Content
            </h3>
            <p className="mb-4 font-sans text-sm text-muted-foreground leading-relaxed">
              The Service and its original content (excluding content provided by users or third-party sources), features, and functionality are owned by Estew and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="mb-3 font-sans text-base font-medium text-foreground">
              6.2 Third-Party Content
            </h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              Our Service aggregates and curates content from third-party sources. We respect the intellectual property rights of others and provide attribution to original sources. The respective owners retain all rights to their content.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              7. Disclaimer of Warranties
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. WE DO NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR RELIABILITY OF ANY CONTENT AVAILABLE THROUGH THE SERVICE.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              8. Limitation of Liability
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ESTEW AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              9. Indemnification
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless Estew and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys&apos; fees) arising out of or in any way connected with your access to or use of the Service, your violation of these Terms, or your violation of any rights of another.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              10. Governing Law
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Estew operates, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration or in the courts of competent jurisdiction.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              11. Changes to Terms
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              12. Severability
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
              13. Contact Us
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="mt-4 rounded-lg border border-border bg-card/50 p-4">
              <p className="font-sans text-sm text-foreground">
                <strong>Estew</strong><br />
                Email: legal@estew.xyz<br />
                Website: https://estew.xyz
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="font-sans text-xs text-muted-foreground">
            Estew 2026
          </span>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="font-sans text-xs text-foreground font-medium">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
