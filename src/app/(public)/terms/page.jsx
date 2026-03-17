import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | RentSafe",
  description: "RentSafe terms and conditions.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          
          <h1 className="text-2xl md:text-3xl font-bold text-[#2B2F38]">
            Terms & Conditions
          </h1>

          <p className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <p className="text-base text-[#5A5E67] leading-7">
            Welcome to <strong>RentSafe</strong>. By using our platform, you agree
            to these Terms & Conditions.
          </p>

          {/* 1 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              1. Platform Purpose
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              RentSafe is a platform that connects property owners and tenants.
              We do not own, manage, or directly rent any properties listed on
              the platform.
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              2. User Responsibility
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              Users are responsible for the accuracy of the information they
              provide. Property owners must ensure listings are correct, and
              tenants should verify details before making any decisions.
            </p>
          </div>

          {/* 3 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              3. No Transactions on Platform
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              RentSafe does not handle any payments, agreements, or financial
              transactions. All deals and agreements are made directly between
              users outside the platform.
            </p>
          </div>

          {/* 4 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              4. Limitation of Liability
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              RentSafe is not responsible for any disputes, losses, damages, or
              issues arising between users. We act only as a platform for
              connecting people.
            </p>
          </div>

          {/* 5 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              5. Prohibited Use
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              Users must not post false information, engage in fraudulent
              activities, or misuse the platform in any way.
            </p>
          </div>

          {/* 6 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              6. Account Termination
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              We reserve the right to suspend or remove accounts that violate
              these terms or misuse the platform.
            </p>
          </div>

          {/* 7 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              7. Changes to Terms
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              These Terms may be updated from time to time. Continued use of the
              platform means you accept the updated terms.
            </p>
          </div>

          {/* 8 */}
          <div>
            <h2 className="font-semibold text-lg text-[#2B2F38]">
              8. Contact Us
            </h2>
            <p className="text-[#5A5E67] leading-7 mt-2">
              For any questions, contact us at support@rentsafe.com.
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