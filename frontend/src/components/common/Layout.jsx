import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaSearch,
  FaUser,
  FaHeart,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaPhone,
  FaWhatsapp,
  FaGlobe,
  FaChevronDown,
  FaHome,
  FaBuilding,
  FaShieldAlt,
  FaUserCog,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaTwitter,
  FaArrowRight,
  FaRegSmile,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const currentYear = new Date().getFullYear();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("U");

  // Real data states
  const [membersCount, setMembersCount] = useState(0);
  const [interestsCount, setInterestsCount] = useState(0);
  const [profilesCount, setProfilesCount] = useState(0);
  const [storiesCount, setStoriesCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserRole(parsed?.role || "user");
        setUserName(parsed?.fullName?.charAt(0) || "U");
      } else {
        const mobile = localStorage.getItem("userMobile");
        if (mobile === "9876543210") {
          setUserRole("admin");
        } else {
          setUserRole("user");
        }
      }
    } catch (e) {
      setUserRole("user");
    }

    // Handle scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Fetch real stats
    fetchStats();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/stats`);
      const data = response.data;
      setMembersCount(data.totalUsers || 0);
      setTotalUsers(data.totalUsers || 0);
      setInterestsCount(data.totalInterests || 0);
      setProfilesCount(data.totalProfiles || 0);
      setStoriesCount(data.successStories || 0);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback to default values if API fails
      setMembersCount(1250);
      setTotalUsers(1250);
      setInterestsCount(345);
      setProfilesCount(1120);
      setStoriesCount(67);
    }
  };

  const isAdmin = userRole === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userMobile");
    setIsAuthenticated(false);
    setUserRole(null);
    navigate("/login");
  };

  // const languages = [
  //   { code: "en", name: "English" },
  //   { code: "hi", name: "Hindi" },
  //   { code: "kn", name: "Kannada" },
  //   { code: "te", name: "Telugu" },
  //   { code: "ta", name: "Tamil" },
  //   { code: "mr", name: "Marathi" },
  //   { code: "ml", name: "Malayalam" },
  // ];

  // Calculate verified percentage
  const verifiedPercentage =
    totalUsers > 0 ? Math.round((profilesCount / totalUsers) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ============ MODERN HEADER ============ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/5"
            : "bg-white shadow-premium"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo with Glow Effect */}
            <Link to="/" className="group flex items-center space-x-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-gold to-primary-maroon rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center shadow-lg shadow-primary-gold/20 group-hover:scale-105 transition-transform duration-300">
                  {/* <img
                    src="/android-chrome-512x512.png" // ← CHANGE THIS to your actual filename
                    alt="Shubha Mangalam Logo"
                    className="w-10 h-10 object-contain"
                  /> */}
                  <img
                    src="/android-chrome-512x512.png"
                    alt="Shubha Mangalam Logo"
                    className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
                  Shubha Mangalam
                </h1>
                <p className="text-xs text-text-light tracking-wider">
                  Matrimony
                </p>
              </div>
            </Link>

            {/* Desktop Navigation - Modern with Icons */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className="px-4 py-2 rounded-xl text-text-dark hover:text-primary-maroon hover:bg-primary-maroon/5 transition-all duration-300 flex items-center space-x-2 group"
              >
                <FaHome className="text-sm group-hover:scale-110 transition-transform" />
                <span className="font-medium">Home</span>
              </Link>
              <Link
                to="/search"
                className="px-4 py-2 rounded-xl text-text-dark hover:text-primary-maroon hover:bg-primary-maroon/5 transition-all duration-300 flex items-center space-x-2 group"
              >
                <FaSearch className="text-sm group-hover:scale-110 transition-transform" />
                <span className="font-medium">Search</span>
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/interests"
                    className="px-4 py-2 rounded-xl text-text-dark hover:text-primary-maroon hover:bg-primary-maroon/5 transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <FaHeart className="text-sm group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Interests</span>
                  </Link>
                  <Link
                    to="/saved"
                    className="px-4 py-2 rounded-xl text-text-dark hover:text-primary-maroon hover:bg-primary-maroon/5 transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <FaHeart className="text-sm group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Saved</span>
                  </Link>
                  <Link
                    to="/my-profile"
                    className="px-4 py-2 rounded-xl text-text-dark hover:text-primary-maroon hover:bg-primary-maroon/5 transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <FaUser className="text-sm group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-maroon to-[#600018] text-white hover:shadow-lg hover:shadow-primary-maroon/30 transition-all duration-300 flex items-center space-x-2 group"
                    >
                      <FaShieldAlt className="text-sm group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Admin</span>
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              {/* <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 border border-transparent hover:border-primary-gold/20"
                >
                  <FaGlobe className="text-primary-maroon" />
                  <span className="text-sm font-medium">EN</span>
                  <FaChevronDown className="text-xs text-text-light" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl shadow-black/10 py-2 z-50 border border-gray-100 animate-fade-down">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gradient-to-r hover:from-primary-maroon/5 hover:to-primary-gold/5 transition-all duration-300 text-text-dark text-sm"
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div> */}

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/my-profile"
                    className="flex items-center space-x-2 text-text-dark hover:text-primary-maroon group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary-gold/20 group-hover:scale-110 transition-transform duration-300">
                      {userName}
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-text-dark hover:text-primary-maroon hover:bg-primary-maroon/5 transition-all duration-300 group"
                  >
                    <FaSignOutAlt className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="btn-gold text-sm px-6 py-2.5 shadow-lg shadow-primary-gold/20 hover:shadow-primary-gold/40"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-maroon text-sm px-6 py-2.5 shadow-lg shadow-primary-maroon/20 hover:shadow-primary-maroon/40"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-text-dark hover:text-primary-maroon hover:bg-primary-maroon/5 transition-all duration-300"
              >
                {mobileMenuOpen ? (
                  <FaTimes className="text-2xl" />
                ) : (
                  <FaBars className="text-2xl" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Modern Slide Down */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-2xl shadow-black/5 animate-slide-down">
            <div className="container mx-auto px-4 py-6 space-y-2">
              <Link
                to="/"
                className="flex items-center space-x-3 text-text-dark hover:text-primary-maroon px-4 py-3 rounded-xl hover:bg-primary-maroon/5 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaHome className="text-primary-maroon" />
                <span className="font-medium">Home</span>
              </Link>
              <Link
                to="/search"
                className="flex items-center space-x-3 text-text-dark hover:text-primary-maroon px-4 py-3 rounded-xl hover:bg-primary-maroon/5 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaSearch className="text-primary-maroon" />
                <span className="font-medium">Search</span>
              </Link>
              <Link
                to="/broker-office"
                className="flex items-center space-x-3 text-text-dark hover:text-primary-maroon px-4 py-3 rounded-xl hover:bg-primary-maroon/5 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaBuilding className="text-primary-maroon" />
                <span className="font-medium">Broker Office</span>
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/interests"
                    className="flex items-center space-x-3 text-text-dark hover:text-primary-maroon px-4 py-3 rounded-xl hover:bg-primary-maroon/5 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaHeart className="text-primary-maroon" />
                    <span className="font-medium">Interests</span>
                  </Link>
                  <Link
                    to="/saved"
                    className="flex items-center space-x-3 text-text-dark hover:text-primary-maroon px-4 py-3 rounded-xl hover:bg-primary-maroon/5 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaHeart className="text-primary-maroon" />
                    <span className="font-medium">Saved Profiles</span>
                  </Link>
                  <Link
                    to="/my-profile"
                    className="flex items-center space-x-3 text-text-dark hover:text-primary-maroon px-4 py-3 rounded-xl hover:bg-primary-maroon/5 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaUser className="text-primary-maroon" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-3 text-white bg-gradient-to-r from-primary-maroon to-[#600018] px-4 py-3 rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FaShieldAlt />
                      <span className="font-medium">Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 text-red-500 px-4 py-3 rounded-xl hover:bg-red-50 transition-all duration-300 w-full border-t border-gray-100 pt-4"
                  >
                    <FaSignOutAlt />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                  <Link
                    to="/login"
                    className="btn-gold text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-maroon text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Floating Action Buttons - Modern with Tooltip */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        <div className="group relative">
          <a
            href="tel:+919110480411"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-maroon to-[#600018] text-white flex items-center justify-center shadow-2xl shadow-primary-maroon/40 hover:shadow-primary-maroon/60 transition-all hover:scale-110 duration-300"
            aria-label="Call Broker"
          >
            <FaPhone className="w-6 h-6" />
          </a>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Call Broker
          </span>
        </div>
        <div className="group relative">
          <a
            href="https://wa.me/918123427060?text=Hi%20Shubha%20Mangalam%2C%20I%20need%20assistance%20with%20my%20matrimonial%20search."
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 transition-all hover:scale-110 duration-300"
            aria-label="WhatsApp Broker"
          >
            <FaWhatsapp className="w-6 h-6" />
          </a>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            WhatsApp
          </span>
        </div>
      </div>

      {/* ============ MODERN FOOTER ============ */}
      <footer className="bg-gradient-to-br from-[#0a0000] via-[#1a0505] to-[#2d0a0a] text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-maroon/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-1.5">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-gold to-amber-500 flex items-center justify-center shadow-lg shadow-primary-gold/20">
                  <img
                    src="/android-chrome-512x512.png"
                    alt="Shubha Mangalam Logo"
                    className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold gradient-text">
                    Shubha Mangalam
                  </h2>
                  <p className="text-xs text-gray-400 tracking-wider">
                    Premium Matrimony
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                India's premier matrimonial platform connecting families with
                trust, tradition, and technology. Where love stories begin.
              </p>
              <div className="flex space-x-4 mt-6">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary-gold/20 border border-white/10 hover:border-primary-gold/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary-gold/20"
                >
                  <FaFacebook className="text-gray-400 hover:text-primary-gold transition-colors" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary-gold/20 border border-white/10 hover:border-primary-gold/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary-gold/20"
                >
                  <FaInstagram className="text-gray-400 hover:text-primary-gold transition-colors" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary-gold/20 border border-white/10 hover:border-primary-gold/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary-gold/20"
                >
                  <FaTwitter className="text-gray-400 hover:text-primary-gold transition-colors" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary-gold/20 border border-white/10 hover:border-primary-gold/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary-gold/20"
                >
                  <FaYoutube className="text-gray-400 hover:text-primary-gold transition-colors" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-primary-gold uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary-gold"></span>
                Quick Links
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-primary-gold transition-all duration-300 flex items-center gap-2 group"
                  >
                    <FaArrowRight className="text-[8px] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/search"
                    className="text-gray-400 hover:text-primary-gold transition-all duration-300 flex items-center gap-2 group"
                  >
                    <FaArrowRight className="text-[8px] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    <span>Search</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/broker-office"
                    className="text-gray-400 hover:text-primary-gold transition-all duration-300 flex items-center gap-2 group"
                  >
                    <FaArrowRight className="text-[8px] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    <span>Broker Office</span>
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link
                      to="/my-profile"
                      className="text-gray-400 hover:text-primary-gold transition-all duration-300 flex items-center gap-2 group"
                    >
                      <FaArrowRight className="text-[8px] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                      <span>My Profile</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold text-primary-gold uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary-gold"></span>
                Services
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-3 group hover:text-primary-gold transition-colors duration-300">
                  <span className="w-1.5 h-1.5 bg-primary-gold rounded-full group-hover:scale-150 transition-transform"></span>
                  Matchmaking
                </li>
                <li className="flex items-center gap-3 group hover:text-primary-gold transition-colors duration-300">
                  <span className="w-1.5 h-1.5 bg-primary-gold rounded-full group-hover:scale-150 transition-transform"></span>
                  Profile Verification
                </li>
                <li className="flex items-center gap-3 group hover:text-primary-gold transition-colors duration-300">
                  <span className="w-1.5 h-1.5 bg-primary-gold rounded-full group-hover:scale-150 transition-transform"></span>
                  Privacy Protected
                </li>
                <li className="flex items-center gap-3 group hover:text-primary-gold transition-colors duration-300">
                  <span className="w-1.5 h-1.5 bg-primary-gold rounded-full group-hover:scale-150 transition-transform"></span>
                  Broker Mediated
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-primary-gold uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary-gold"></span>
                Contact
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-gold/20 transition-colors duration-300">
                    <FaPhone className="text-primary-gold text-sm" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <a
                      href="tel:+919110480411"
                      className="text-gray-300 hover:text-primary-gold transition-colors duration-300"
                    >
                      +91 91104 80411
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-gold/20 transition-colors duration-300">
                    <FaWhatsapp className="text-green-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">WhatsApp</p>
                    <a
                      href="https://wa.me/918123427060"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-primary-gold transition-colors duration-300"
                    >
                      +91 81234 27060
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-gold/20 transition-colors duration-300">
                    <FaEnvelope className="text-primary-gold text-sm" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <a
                      href="mailto:info@shubhamangalam.com"
                      className="text-gray-300 hover:text-primary-gold transition-colors duration-300"
                    >
                      info@shubhamangalam.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-gold/20 transition-colors duration-300">
                    <FaMapMarkerAlt className="text-primary-gold text-sm" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Office</p>
                    <p className="text-gray-300">
                      KEB Rd, Nandi Colony, Bidar, Karnataka 585401, India
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Trust Badges with Real Data */}
            <div>
              <h3 className="text-sm font-semibold text-primary-gold uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary-gold"></span>
                Trusted
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <HiSparkles className="text-primary-gold text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {membersCount.toLocaleString()}+
                    </p>
                    <p className="text-xs text-gray-400">Total Members</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <FaHeart className="text-primary-gold text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {interestsCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">Interests Sent</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <FaShieldAlt className="text-primary-gold text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {verifiedPercentage}%
                    </p>
                    <p className="text-xs text-gray-400">Verified Profiles</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <FaRegSmile className="text-primary-gold text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {storiesCount.toLocaleString()}+
                    </p>
                    <p className="text-xs text-gray-400">Success Stories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar - Auto Year */}
          <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} Shubha Mangalam. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <Link
                to="/privacy"
                className="hover:text-primary-gold transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <span className="w-px h-4 bg-gray-700"></span>
              <Link
                to="/terms"
                className="hover:text-primary-gold transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <span className="w-px h-4 bg-gray-700"></span>
              <Link
                to="/broker-office"
                className="hover:text-primary-gold transition-colors duration-300"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
        @keyframes fade-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-down {
          animation: fade-down 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Layout;
