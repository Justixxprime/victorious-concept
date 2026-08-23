import SEO from '../components/SEO'

function PrivacyPolicy() {
  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-20 px-6">
      <SEO title="Privacy Policy" description="How Victorious Concept handles your data." />
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-8">
          Privacy Policy
        </h1>
        <div className="flex flex-col gap-6 font-sans text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
          <p>
            Victorious Concept respects your privacy. This page explains what information we
            collect when you use this website, and how it is used.
          </p>
          <div>
            <h2 className="font-sans font-medium text-espresso dark:text-cream mb-2">Information we collect</h2>
            <p>
              When you create an account, place an order, or contact us, we collect your name,
              email address, phone number, and delivery address. This information is used only
              to process your orders and communicate with you about them.
            </p>
          </div>
          <div>
            <h2 className="font-sans font-medium text-espresso dark:text-cream mb-2">Payment information</h2>
            <p>
              Card payments are processed securely through Paystack. We never see or store your
              full card details on our servers, that information is handled entirely by Paystack's
              secure payment systems.
            </p>
          </div>
          <div>
            <h2 className="font-sans font-medium text-espresso dark:text-cream mb-2">How we store your data</h2>
            <p>
              Your account and order information is stored securely using Supabase, a trusted
              database provider. Access to customer data is restricted and protected.
            </p>
          </div>
          <div>
            <h2 className="font-sans font-medium text-espresso dark:text-cream mb-2">Your rights</h2>
            <p>
              You can request access to, correction of, or deletion of your personal data at any
              time by contacting us directly through WhatsApp or email.
            </p>
          </div>
          <div>
            <h2 className="font-sans font-medium text-espresso dark:text-cream mb-2">Contact</h2>
            <p>
              Questions about this policy can be sent to Victoriaobioma31@yahoo.com or via
              WhatsApp at +234 812 247 0435.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PrivacyPolicy