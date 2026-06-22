import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import Layout from "../components/common/Layout";

const PrivacyPage = () => {
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
            <div className="flex items-center gap-3 mb-2">
              <FaShieldAlt className="text-3xl text-primary-gold" />
              <h1 className="text-3xl md:text-4xl font-bold text-text-dark">
                Privacy Policy
              </h1>
            </div>
            <p className="text-text-light text-sm mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-6 text-text-dark">
              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  Introduction
                </h2>
                <p className="text-text-light leading-relaxed">
                  At Shubha Mangalam, we take your privacy seriously. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our matrimonial
                  platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  Information We Collect
                </h2>
                <p className="text-text-light leading-relaxed font-medium mb-2">
                  Personal Information:
                </p>
                <ul className="list-disc pl-6 text-text-light space-y-1">
                  <li>Full name</li>
                  <li>Mobile number</li>
                  <li>Email address</li>
                  <li>Date of birth</li>
                  <li>Gender</li>
                  <li>Location (city, state)</li>
                  <li>Education and occupation details</li>
                  <li>Family details</li>
                  <li>Partner preferences</li>
                  <li>Profile photos</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 text-text-light space-y-1">
                  <li>To create and manage your matrimonial profile</li>
                  <li>To facilitate matchmaking services</li>
                  <li>
                    To connect you with potential matches through our brokers
                  </li>
                  <li>To send you relevant notifications and updates</li>
                  <li>To improve our services and user experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  Information Sharing
                </h2>
                <p className="text-text-light leading-relaxed">
                  We do not sell, trade, or rent your personal information to
                  third parties. Your contact details are never shared directly
                  with other users. All communication is mediated through our
                  brokers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  Data Security
                </h2>
                <p className="text-text-light leading-relaxed">
                  We implement appropriate security measures to protect your
                  personal information from unauthorized access, alteration,
                  disclosure, or destruction. This includes encryption, secure
                  servers, and access controls.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  Your Rights
                </h2>
                <ul className="list-disc pl-6 text-text-light space-y-1">
                  <li>Access and update your profile information</li>
                  <li>Delete your account and data</li>
                  <li>Opt-out of communications</li>
                  <li>Request a copy of your data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-primary-maroon mb-3">
                  Contact Us
                </h2>
                <p className="text-text-light leading-relaxed">
                  If you have questions about this Privacy Policy, contact us
                  at:
                </p>
                <p className="text-text-light mt-2">
                  Email: shubhamangalam79@gmail.com
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

export default PrivacyPage;
