import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaArrowLeft } from "react-icons/fa";
import Layout from "../components/common/Layout";

const TermsPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-maroon hover:text-[#600018] transition-colors mb-6"
          >
            <FaArrowLeft />
            <span>Back to Home</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-premium p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-2">
              Terms of Service
            </h1>
            <p className="text-text-light text-sm mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-6 text-text-dark">
              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  1. Acceptance of Terms
                </h2>
                <p className="text-text-light leading-relaxed">
                  By using Shubha Mangalam ("we", "us", or "our"), you agree to
                  comply with and be bound by these Terms of Service. If you do
                  not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  2. Description of Service
                </h2>
                <p className="text-text-light leading-relaxed">
                  Shubha Mangalam is a matrimonial platform that connects
                  individuals seeking life partners through our broker-mediated
                  matchmaking services. We provide profile creation, search,
                  interest management, and broker facilitation services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  3. User Accounts
                </h2>
                <p className="text-text-light leading-relaxed">
                  To access our services, you must create an account with
                  accurate and complete information. You are responsible for
                  maintaining the confidentiality of your account credentials
                  and for all activities that occur under your account.
                </p>
                <ul className="list-disc pl-6 mt-2 text-text-light space-y-1">
                  <li>You must be at least 18 years of age to register</li>
                  <li>
                    You agree to provide truthful and accurate information
                  </li>
                  <li>You are responsible for all activity on your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  4. User Conduct
                </h2>
                <p className="text-text-light leading-relaxed">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 mt-2 text-text-light space-y-1">
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Impersonate any person or entity</li>
                  <li>Share inappropriate or offensive content</li>
                  <li>Use the platform for any illegal purpose</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  5. Broker Mediation
                </h2>
                <p className="text-text-light leading-relaxed">
                  All communication between users is facilitated through our
                  brokers. Contact details of users are not shared directly.
                  Brokers act as intermediaries to ensure privacy and security
                  for all parties involved.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  6. Privacy
                </h2>
                <p className="text-text-light leading-relaxed">
                  Your privacy is important to us. Please review our Privacy
                  Policy to understand how we collect, use, and protect your
                  personal information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  7. Termination
                </h2>
                <p className="text-text-light leading-relaxed">
                  We reserve the right to suspend or terminate your account at
                  our discretion, without notice, for conduct that we believe
                  violates these terms or is harmful to other users.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  8. Contact Us
                </h2>
                <p className="text-text-light leading-relaxed">
                  If you have any questions about these Terms of Service, please
                  contact us at:
                </p>
                <p className="text-text-light mt-2">
                  Email: info@shubhamangalam.com
                  <br />
                  Phone: +91 91104 80411
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsPage;
