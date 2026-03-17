export const metadata = {
  title: "Privacy Policy | RentSafe",
  description: "RentSafe privacy policy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2B2F38]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base text-[#5A5E67] leading-7">
            This is a placeholder Privacy Policy page for RentSafe.
          </p>
          <p className="mt-3 text-base text-[#5A5E67] leading-7">
            Final legal content can be added here without changing the route.
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex items-center rounded-lg border border-[#4A2FCC] px-4 py-2 text-sm font-semibold text-[#4A2FCC] hover:bg-[#4A2FCC] hover:text-white transition-colors"
          >
            Back to Login
          </a>
        </section>
      </main>
    </div>
  );
}
