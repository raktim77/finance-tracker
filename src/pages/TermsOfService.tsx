import Footer from "../components/Footer";

const sectionTitleClass =
  "text-lg font-semibold text-[var(--color-text-primary)] md:text-xl";

const paragraphClass =
  "mt-3 text-sm leading-7 text-[var(--color-text-secondary)] md:text-[15px]";

export default function TermsOfService() {
  return (
    <div className="min-h-full bg-[var(--color-background)]">
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          
        />
        <div className="relative mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-teal)]">
            Legal
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] md:text-6xl">
            Terms of Service
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">
            These Terms of Service govern your access to and use of Xpensio,
            including our website, apps, and related services.
          </p>
          <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
            Effective date: April 10, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="rounded-[28px] border border-black/10 bg-[var(--color-surface)] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.08)] dark:border-white/10 md:p-10">
          <div className="space-y-10">
            <section>
              <h2 className={sectionTitleClass}>1. Acceptance of Terms</h2>
              <p className={paragraphClass}>
                By creating an account, accessing, or using Xpensio, you agree
                to be bound by these Terms. If you do not agree, please do not
                use the service.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>2. Eligibility and Accounts</h2>
              <p className={paragraphClass}>
                You are responsible for ensuring that the information you
                provide is accurate and current. You are also responsible for
                maintaining the confidentiality of your account credentials and
                for activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>3. Permitted Use</h2>
              <p className={paragraphClass}>
                Xpensio is provided to help you track finances, budgets,
                accounts, and related insights. You agree not to misuse the
                platform, interfere with its operation, attempt unauthorized
                access, or use the service in a way that violates applicable law
                or the rights of others.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>4. Your Data</h2>
              <p className={paragraphClass}>
                You retain ownership of the data you submit to Xpensio. By
                using the service, you grant us the rights reasonably necessary
                to host, process, back up, and display that data for the purpose
                of operating and improving the product.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>5. Third-Party Services</h2>
              <p className={paragraphClass}>
                Some features may rely on third-party tools or authentication
                providers, such as Google sign-in or infrastructure services.
                Your use of those services may also be subject to their own
                terms and privacy practices.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>6. Availability and Changes</h2>
              <p className={paragraphClass}>
                We may update, modify, suspend, or discontinue parts of Xpensio
                from time to time. We aim to keep the service reliable, but we
                do not guarantee uninterrupted availability or that every
                feature will always remain the same.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>7. Security</h2>
              <p className={paragraphClass}>
                We take reasonable steps to protect the service, but no platform
                is completely secure. You should use a strong password, protect
                your device, and notify us promptly if you believe your account
                has been compromised.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>8. Disclaimers</h2>
              <p className={paragraphClass}>
                Xpensio is offered on an &quot;as is&quot; and &quot;as
                available&quot; basis. Financial summaries, categorizations, and
                insights are provided for convenience and informational purposes
                only and should not be treated as professional financial, tax,
                or legal advice.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>9. Limitation of Liability</h2>
              <p className={paragraphClass}>
                To the fullest extent permitted by law, Xpensio and its
                operators will not be liable for indirect, incidental, special,
                consequential, or punitive damages, or for loss of profits,
                data, goodwill, or business opportunities arising from your use
                of the service.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>10. Termination</h2>
              <p className={paragraphClass}>
                We may suspend or terminate access if these Terms are violated
                or if use of the service creates risk or harm. You may stop
                using Xpensio at any time.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>11. Updates to These Terms</h2>
              <p className={paragraphClass}>
                We may revise these Terms periodically. When we make material
                changes, we may update the effective date and provide notice
                through the app or website where appropriate. Continued use of
                Xpensio after changes become effective means you accept the
                revised Terms.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>12. Contact</h2>
              <p className={paragraphClass}>
                Questions about these Terms can be directed through the contact
                channels made available by Xpensio within the product or on the
                website.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
