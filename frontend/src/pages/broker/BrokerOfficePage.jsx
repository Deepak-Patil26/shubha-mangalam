import React from "react";
import {
  FaPhone,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaClock,
  FaBuilding,
  FaEnvelope,
} from "react-icons/fa";
import Layout from "../../components/common/Layout";

const BrokerOfficePage = () => {
  const officeAddress = "KEB Rd, Nandi Colony, Bidar, Karnataka 585401, India";
  const embedMapUrl =
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3796.3697542277177!2d77.5128!3d17.9149!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcec6d0ab3faa71%3A0xe68121ab6aa16654!2sKEB%20Rd%2C%20Bidar%2C%20Karnataka%20585401!5e0!3m2!1sen!2sin!4v1781987322573!5m2!1sen!2sin";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text-dark mb-4">
              Broker <span className="gradient-text">Office</span>
            </h1>
            <p className="text-text-light text-lg">
              Visit our office or contact us directly
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="premium-card p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center">
                    <FaBuilding className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-dark">
                      Shubha Mangalam
                    </h3>
                    <p className="text-text-light text-sm">Matrimony Office</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FaMapMarkerAlt className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-dark font-medium">Address</p>
                      <p className="text-text-light text-sm">{officeAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FaPhone className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-dark font-medium">Phone</p>
                      <a
                        href="tel:+919110480411"
                        className="text-text-light text-sm hover:text-primary-maroon"
                      >
                        +91 91104 80411
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FaWhatsapp className="text-green-500 mt-1" />
                    <div>
                      <p className="text-text-dark font-medium">WhatsApp</p>
                      <a
                        href="https://wa.me/918123427060"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-light text-sm hover:text-green-500"
                      >
                        +91 81234 27060
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FaEnvelope className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-dark font-medium">Email</p>
                      <a
                        href="mailto:shubhamangalam79@gmail.com"
                        className="text-text-light text-sm hover:text-primary-maroon"
                      >
                        shubhamangalam79@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FaClock className="text-primary-gold text-xl" />
                  <h3 className="text-lg font-semibold text-text-dark">
                    Working Hours
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-light">Monday - Friday</span>
                    <span className="text-text-dark font-medium">
                      9:00 AM - 8:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Saturday</span>
                    <span className="text-text-dark font-medium">
                      10:00 AM - 6:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Sunday</span>
                    <span className="text-text-dark font-medium">Closed</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href="tel:+919110480411"
                  className="btn-maroon w-full flex items-center justify-center space-x-2"
                >
                  <FaPhone />
                  <span>Call Broker</span>
                </a>
                <a
                  href="https://wa.me/918123427060"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold w-full flex items-center justify-center space-x-2"
                >
                  <FaWhatsapp />
                  <span>WhatsApp Broker</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="premium-card p-4 h-full">
                <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
                  <FaMapMarkerAlt className="text-primary-maroon mr-2" />
                  Find Us Here
                </h3>
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "56.25%" }}
                >
                  <iframe
                    src={embedMapUrl}
                    className="absolute top-0 left-0 w-full h-full rounded-xl"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Shubha Mangalam Office Location"
                  />
                </div>
                Address
                <div className="mt-4 text-center">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(officeAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-maroon inline-flex items-center space-x-2"
                  >
                    <FaMapMarkerAlt />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BrokerOfficePage;
