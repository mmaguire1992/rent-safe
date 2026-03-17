
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | RentSafe",
  description: "RentSafe privacy policy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">

          <h1 className="text-2xl md:text-3xl font-bold text-[#2B2F38]">
            Privacy Policy
          </h1>

          <p className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <p className="text-base text-[#5A5E67] leading-7">
            At <strong>RentSafe</strong>, we value your privacy and are committed
            to protecting your personal information. This Privacy Policy explains
            how we collect, use, and safeguard your data when you use our platform.
          </p>

          {/* 1 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              1. Information We Collect
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              We may collect personal information such as your name, email
              address, phone number, and account details when you register.
              If you use our rental services, we may also collect property
              details, rental preferences, and communication data.
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              2. How We Use Your Information
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              We use your information to operate the platform, manage listings,
              connect tenants and property owners, provide customer support,
              improve our services, and ensure security. We may also send
              important updates related to your account.
            </p>
          </div>

          {/* 3 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              3. Sharing of Information
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              We do not sell your personal information.
            </p>
          </div>

          {/* 4 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              4. Data Security
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              We implement reasonable technical and organizational measures to
              protect your data.
            </p>
          </div>

          {/* 5 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              5. Your Rights
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              You may access, update, or delete your personal information at any
              time. You can also opt out of non-essential communications by
              adjusting your account settings or contacting us.
            </p>
          </div>



          {/* 6 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              6. Data Retention
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              We retain your data only as long as necessary to provide our
              services and comply with legal obligations.
            </p>
          </div>

          {/* 7 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              7. Changes to This Policy
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              We may update this Privacy Policy from time to time. Updates will
              be posted on this page with a revised date.
            </p>
          </div>

          {/* 9 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              9. Contact Us
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              If you have any questions about this Privacy Policy, you can
              contact us at support@rentsafe.com.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center rounded-lg border border-[#4A2FCC] px-4 py-2 text-sm font-semibold text-[#4A2FCC] hover:bg-[#4A2FCC] hover:text-white transition-colors"
          >
            Back to Login
          </Link>

        </section>
      </main>
    </div>
  );
}