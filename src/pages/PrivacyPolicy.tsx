import Footer from "../components/Footer";

const sectionTitleClass =
  "text-lg font-semibold text-[var(--color-text-primary)] md:text-xl";

const paragraphClass =
  "mt-3 text-sm leading-7 text-[var(--color-text-secondary)] md:text-[15px]";

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">
            This Privacy Policy explains how Xpensio collects, uses, stores,
            and protects information when you use our website, apps, and
            related services.
          </p>
          <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
            Effective date: April 10, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 md:px-8 mb-16">
        <div className="rounded-[28px] border border-black/10 bg-[var(--color-surface)] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.08)] dark:border-white/10 md:p-10">
          <div className="space-y-10">
            <section>
              <h2 className={sectionTitleClass}>1. Information We Collect</h2>
              <p className={paragraphClass}>
                We may collect information you provide directly, such as your
                name, email address, account credentials, profile information,
                transaction records, budgets, account data, and settings. We
                may also collect technical information needed to operate the
                service, such as device details, browser type, app diagnostics,
                and usage events.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>2. How We Use Information</h2>
              <p className={paragraphClass}>
                We use information to provide and improve Xpensio, authenticate
                users, sync data across devices, personalize your experience,
                monitor reliability, prevent abuse, and communicate important
                service updates.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>3. Authentication and Security</h2>
              <p className={paragraphClass}>
                If you sign in with email, OTP, or third-party providers such as
                Google, we process the minimum information necessary to verify
                identity, protect your account, and maintain secure sessions.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>4. How We Share Information</h2>
              <p className={paragraphClass}>
                We do not sell your personal information. We may share data with
                trusted service providers who support hosting, analytics,
                authentication, storage, customer support, or security, but only
                as needed to operate Xpensio and subject to appropriate
                safeguards.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>5. Data Retention</h2>
              <p className={paragraphClass}>
                We retain information for as long as needed to provide the
                service, comply with legal obligations, resolve disputes, and
                enforce agreements. Retention periods may vary depending on the
                type of data and operational requirements.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>6. Cookies and Similar Technologies</h2>
              <p className={paragraphClass}>
                Xpensio may use cookies, local storage, and similar
                technologies to keep you signed in, remember preferences,
                support security features, and understand product usage.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>7. Your Choices</h2>
              <p className={paragraphClass}>
                You may be able to update certain profile details or app
                settings from within the product. You can also choose not to use
                particular features, though doing so may limit functionality.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>8. Data Security</h2>
              <p className={paragraphClass}>
                We use reasonable administrative, technical, and organizational
                measures designed to help protect personal information.
                However, no method of storage or transmission is completely
                secure, and absolute security cannot be guaranteed.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>9. Children&apos;s Privacy</h2>
              <p className={paragraphClass}>
                Xpensio is not intended for children under the age required by
                applicable law to provide their own consent. If we learn that we
                have collected personal information from a child in violation of
                applicable law, we will take appropriate steps to delete it.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>10. International Processing</h2>
              <p className={paragraphClass}>
                Depending on how Xpensio is hosted and used, information may be
                processed in countries other than your own. Where required, we
                take steps intended to provide appropriate safeguards for such
                transfers.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>11. Changes to This Policy</h2>
              <p className={paragraphClass}>
                We may update this Privacy Policy from time to time. When we do,
                we will revise the effective date and may provide additional
                notice through the app or website when appropriate.
              </p>
            </section>

            <section>
              <h2 className={sectionTitleClass}>12. Contact</h2>
              <p className={paragraphClass}>
                If you have questions about this Privacy Policy or how your
                information is handled, please use the support or contact options
                provided by Xpensio.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
