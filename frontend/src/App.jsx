import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// Layout
import Layout from "./components/common/Layout";

// Pages
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import BrokerOfficePage from "./pages/broker/BrokerOfficePage";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import SuccessStoriesPage from "./pages/SuccessStoriesPage";
import AdminSuccessStoriesPage from "./pages/admin/SuccessStoriesPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

// Import icons
import {
  FaHeart,
  FaCheckCircle,
  FaUsers,
  FaPhone,
  FaExclamationTriangle,
  FaStar,
  FaSearch,
  FaUser,
  FaEdit,
  FaCamera,
  FaTrash,
  FaMapMarkerAlt,
  FaCalendar,
  FaGraduationCap,
  FaBriefcase,
  FaMoneyBillWave,
  FaRulerVertical,
  FaWeight,
  FaUserFriends,
  FaHome,
  FaArrowRight,
  FaSpinner,
  FaFilter,
  FaTimes,
  FaSave,
  FaArrowLeft,
  FaWhatsapp,
  FaEnvelope,
  FaGlobe,
  FaBuilding,
  FaPlus,
  FaClock,
  FaUserPlus,
  FaCheck,
  FaPlay,
  FaExpand,
  FaSync,
  FaEye,
  FaBan,
  FaEyeSlash,
  FaQuoteRight,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ==================== AUTH HELPER ====================
const getToken = () => localStorage.getItem("token");
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

// ==================== PLACEHOLDER IMAGE COMPONENT ====================
const PlaceholderImage = ({ text, className }) => (
  <div
    className={`${className} bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center text-white text-4xl font-bold`}
  >
    {text?.charAt(0)?.toUpperCase() || "?"}
  </div>
);

// ==================== SEARCH PAGE - PREMIUM DESIGN WITH REAL-TIME VIEWS ====================
const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    gender: "",
    ageMin: "",
    ageMax: "",
    religion: "",
    location: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [viewedProfiles, setViewedProfiles] = useState(new Set());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load profiles and setup listeners
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role || null);

    const storedViews = sessionStorage.getItem("viewedProfiles");
    if (storedViews) {
      setViewedProfiles(new Set(JSON.parse(storedViews)));
    }

    loadProfiles();

    // Refresh when returning to page
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const needsRefresh = sessionStorage.getItem("refreshSearch") === "true";
        if (needsRefresh) {
          sessionStorage.removeItem("refreshSearch");
          loadProfiles();
        }
      }
    };

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "viewCountUpdate") {
        loadProfiles();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorageChange);

    // Poll for updates every 30 seconds (optional)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        // Only refresh if the page is visible
        loadProfiles();
      }
    }, 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Also refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadProfiles();
    }
  }, [refreshTrigger]);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const timestamp = Date.now();
      const response = await axios.get(`${API_URL}/search/profiles`, {
        params: {
          limit: 50,
          _t: timestamp,
        },
        ...getHeaders(),
      });

      const profiles = (response.data.profiles || []).map((profile) => ({
        ...profile,
        // Ensure viewCount is accessible from statistics
        viewCount: profile.statistics?.profileViews || 0,
      }));

      setAllProfiles(profiles);
      setResults(profiles);
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast.error("Failed to load profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      const filtered = allProfiles.filter((profile) => {
        const pd = profile.personalDetails || {};
        const name = pd.fullName || "";
        const location = pd.location || {};
        const city = location.city || "";
        const state = location.state || "";

        const matchesSearch =
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          state.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesGender =
          !filters.gender ||
          (pd.gender &&
            pd.gender.toLowerCase() === filters.gender.toLowerCase());

        const matchesReligion =
          !filters.religion ||
          (pd.religion &&
            pd.religion.toLowerCase() === filters.religion.toLowerCase());

        const matchesAgeMin =
          !filters.ageMin || (pd.age && pd.age >= parseInt(filters.ageMin));

        const matchesAgeMax =
          !filters.ageMax || (pd.age && pd.age <= parseInt(filters.ageMax));

        const matchesLocation =
          !filters.location ||
          city.toLowerCase().includes(filters.location.toLowerCase()) ||
          state.toLowerCase().includes(filters.location.toLowerCase());

        return (
          matchesSearch &&
          matchesGender &&
          matchesReligion &&
          matchesAgeMin &&
          matchesAgeMax &&
          matchesLocation
        );
      });
      setResults(filtered);
      setIsLoading(false);
    }, 300);
  };

  const clearFilters = () => {
    setFilters({
      gender: "",
      ageMin: "",
      ageMax: "",
      religion: "",
      location: "",
    });
    setSearchTerm("");
    setResults(allProfiles);
    toast.info("All filters cleared");
  };

  const handleAdminDeleteProfile = async (profileId) => {
    if (
      !window.confirm(
        "Delete this profile? The user account will remain active.",
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/profiles/admin/delete/${profileId}`,
        getHeaders(),
      );
      toast.success("Profile deleted successfully!");
      setResults((prev) => prev.filter((p) => p._id !== profileId));
      setAllProfiles((prev) => prev.filter((p) => p._id !== profileId));
    } catch (error) {
      console.error("Delete profile error:", error);
      toast.error(error.response?.data?.message || "Failed to delete profile");
    }
  };

  const refreshSearchResults = () => {
    loadProfiles();
    toast.info("Search results refreshed");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Track profile view - updates the view count in real-time
  const handleProfileView = async (profileId) => {
    if (viewedProfiles.has(profileId)) {
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/profiles/${profileId}/view`,
        {},
        getHeaders(),
      );

      const newViewed = new Set(viewedProfiles);
      newViewed.add(profileId);
      setViewedProfiles(newViewed);
      sessionStorage.setItem("viewedProfiles", JSON.stringify([...newViewed]));

      if (response.data && response.data.viewCount !== undefined) {
        const newViewCount = response.data.viewCount;

        // IMPORTANT: Update both results and allProfiles states
        setResults((prev) =>
          prev.map((p) =>
            p._id === profileId
              ? {
                  ...p,
                  viewCount: newViewCount,
                  statistics: {
                    ...p.statistics,
                    profileViews: newViewCount,
                  },
                }
              : p,
          ),
        );

        setAllProfiles((prev) =>
          prev.map((p) =>
            p._id === profileId
              ? {
                  ...p,
                  viewCount: newViewCount,
                  statistics: {
                    ...p.statistics,
                    profileViews: newViewCount,
                  },
                }
              : p,
          ),
        );

        // Store the update in session storage for cross-tab sync
        const viewUpdates = JSON.parse(
          sessionStorage.getItem("viewUpdates") || "{}",
        );
        viewUpdates[profileId] = newViewCount;
        sessionStorage.setItem("viewUpdates", JSON.stringify(viewUpdates));

        // Trigger storage event for other tabs
        sessionStorage.setItem("viewCountUpdate", Date.now().toString());
      }
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  // Listen for view updates from other tabs
  useEffect(() => {
    const handleViewUpdate = (e) => {
      if (e.key === "viewUpdates") {
        const updates = JSON.parse(e.newValue || "{}");
        setResults((prev) =>
          prev.map((p) => {
            if (updates[p._id]) {
              return {
                ...p,
                viewCount: updates[p._id],
                statistics: { ...p.statistics, profileViews: updates[p._id] },
              };
            }
            return p;
          }),
        );
        setAllProfiles((prev) =>
          prev.map((p) => {
            if (updates[p._id]) {
              return {
                ...p,
                viewCount: updates[p._id],
                statistics: { ...p.statistics, profileViews: updates[p._id] },
              };
            }
            return p;
          }),
        );
      }
    };

    window.addEventListener("storage", handleViewUpdate);
    return () => window.removeEventListener("storage", handleViewUpdate);
  }, []);

  useEffect(() => {
    const count = Object.values(filters).filter(
      (val) => val !== "" && val !== null && val !== undefined,
    ).length;
    setActiveFilterCount(count);
  }, [filters]);

  // Generate gradient based on profile
  const getGradient = (name, index) => {
    const gradients = [
      `bg-gradient-to-br from-[#800020] via-[#D4AF37] to-[#800020]`,
      `bg-gradient-to-br from-[#D4AF37] via-[#800020] to-[#D4AF37]`,
      `bg-gradient-to-br from-[#800020] via-[#D4AF37]/50 to-[#800020]`,
      `bg-gradient-to-br from-[#D4AF37]/70 via-[#800020] to-[#D4AF37]/70`,
      `bg-gradient-to-br from-[#800020]/80 via-[#D4AF37] to-[#800020]/80`,
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#FFFFFF] via-[#FFF9F5] to-[#FFF5F0] py-8 px-4 md:px-8 relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-[#800020]/5 via-[#D4AF37]/5 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-tr from-[#D4AF37]/5 via-[#800020]/5 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#800020]/3 to-[#D4AF37]/3 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <div className="mb-12 transform transition-all duration-700 hover:translate-y-[-2px]">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-[#800020]/10 to-[#D4AF37]/10 rounded-full blur-2xl"></div>
                <h1 className="text-5xl md:text-6xl font-light text-[#333333] tracking-tight relative">
                  Discover
                  <span className="block text-3xl md:text-4xl font-light bg-gradient-to-r from-[#800020] via-[#D4AF37] to-[#800020] bg-clip-text text-transparent mt-2">
                    Your Perfect Match
                  </span>
                </h1>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#800020] to-[#D4AF37] animate-pulse"></div>
                    <span className="text-sm text-[#666666] font-light tracking-wide">
                      {allProfiles.length} profiles available
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gradient-to-b from-[#D4AF37] to-transparent"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#666666] font-light tracking-wide">
                      Curated matches
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={refreshSearchResults}
                  className="group relative px-5 py-2.5 rounded-xl bg-white border border-[#D4AF37]/20 text-[#333333] hover:border-[#800020] transition-all duration-500 flex items-center gap-2 text-sm font-light shadow-sm hover:shadow-xl overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#800020]/5 to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <FaSync
                    className={`text-xs transition-all duration-500 ${isLoading ? "animate-spin" : "group-hover:rotate-180"}`}
                  />
                  <span className="relative">Refresh</span>
                </button>

                <div className="flex p-1 bg-white rounded-xl border border-[#D4AF37]/10 shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-light transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-gradient-to-r from-[#800020] to-[#D4AF37] text-white shadow-md"
                        : "text-[#666666] hover:text-[#333333]"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-light transition-all duration-300 ${
                      viewMode === "list"
                        ? "bg-gradient-to-r from-[#800020] to-[#D4AF37] text-white shadow-md"
                        : "text-[#666666] hover:text-[#333333]"
                    }`}
                  >
                    List
                  </button>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#D4AF37] text-white hover:shadow-xl hover:shadow-[#800020]/25 transition-all duration-500 flex items-center gap-2 text-sm font-light overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#800020] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <FaFilter className="text-xs relative transition-transform duration-300 group-hover:rotate-90" />
                  <span className="relative">
                    {showFilters ? "Hide Filters" : "Filters"}
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFFFFF] text-[#800020] text-[10px] rounded-full flex items-center justify-center font-medium transition-all duration-300 scale-100 hover:scale-110 shadow-md">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8 transition-all duration-500 hover:shadow-2xl">
            <div className="relative bg-white rounded-2xl shadow-lg border border-[#D4AF37]/10 p-2 transition-all duration-300 hover:border-[#D4AF37]/30 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#800020] via-[#D4AF37] to-[#800020] rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity duration-500"></div>
              <div className="flex flex-col md:flex-row items-stretch gap-2 relative">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] transition-colors duration-300 group-focus-within:text-[#800020]">
                    <FaSearch className="text-sm" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, location, or education..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#FFFFFF] border-0 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none transition-all duration-300 text-[#333333] placeholder:text-[#666666] text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSearch}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#D4AF37] text-white font-light hover:shadow-lg hover:shadow-[#800020]/25 transition-all duration-300 flex items-center gap-2 group"
                  >
                    <FaSearch className="text-sm transition-transform duration-300 group-hover:scale-110" />
                    <span>Search</span>
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-5 py-3.5 rounded-xl bg-[#FFFFFF] text-[#666666] hover:bg-[#F5F5F5] hover:text-[#333333] transition-all duration-300 text-sm font-light flex items-center gap-2 border border-[#D4AF37]/10"
                  >
                    <FaTimes className="text-xs transition-transform duration-300 hover:rotate-90" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-8 transition-all duration-500 animate-slideDown">
              <div className="relative bg-white rounded-2xl shadow-lg border border-[#D4AF37]/10 p-6 transition-all duration-300 hover:shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#800020]/5 to-[#D4AF37]/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#D4AF37]/5 to-[#800020]/5 rounded-full blur-2xl"></div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-light bg-gradient-to-r from-[#800020] to-[#D4AF37] bg-clip-text text-transparent tracking-wide">
                      Refine Your Search
                    </h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-[#800020] hover:text-[#600018] font-light flex items-center gap-1 transition-all duration-300 hover:scale-105"
                    >
                      <FaTimes className="text-xs" />
                      Clear all
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="group">
                      <label className="block text-xs font-light text-[#666666] uppercase tracking-wider mb-1.5 transition-colors duration-300 group-hover:text-[#800020]">
                        Gender
                      </label>
                      <select
                        value={filters.gender}
                        onChange={(e) =>
                          setFilters({ ...filters, gender: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D4AF37]/10 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none text-[#333333] text-sm appearance-none cursor-pointer transition-all duration-300 hover:border-[#D4AF37]/30"
                      >
                        <option value="">All</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="group">
                      <label className="block text-xs font-light text-[#666666] uppercase tracking-wider mb-1.5 transition-colors duration-300 group-hover:text-[#800020]">
                        Religion
                      </label>
                      <select
                        value={filters.religion}
                        onChange={(e) =>
                          setFilters({ ...filters, religion: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D4AF37]/10 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none text-[#333333] text-sm appearance-none cursor-pointer transition-all duration-300 hover:border-[#D4AF37]/30"
                      >
                        <option value="">All</option>
                        <option value="hindu">Hindu</option>
                        <option value="muslim">Muslim</option>
                        <option value="christian">Christian</option>
                        <option value="sikh">Sikh</option>
                        <option value="jain">Jain</option>
                        <option value="buddhist">Buddhist</option>
                      </select>
                    </div>

                    <div className="group">
                      <label className="block text-xs font-light text-[#666666] uppercase tracking-wider mb-1.5 transition-colors duration-300 group-hover:text-[#800020]">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="Enter city"
                        value={filters.location}
                        onChange={(e) =>
                          setFilters({ ...filters, location: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D4AF37]/10 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none text-[#333333] text-sm placeholder:text-[#666666] transition-all duration-300 hover:border-[#D4AF37]/30"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-xs font-light text-[#666666] uppercase tracking-wider mb-1.5 transition-colors duration-300 group-hover:text-[#800020]">
                        Min Age
                      </label>
                      <input
                        type="number"
                        placeholder="18"
                        value={filters.ageMin}
                        onChange={(e) =>
                          setFilters({ ...filters, ageMin: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D4AF37]/10 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none text-[#333333] text-sm placeholder:text-[#666666] transition-all duration-300 hover:border-[#D4AF37]/30"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-xs font-light text-[#666666] uppercase tracking-wider mb-1.5 transition-colors duration-300 group-hover:text-[#800020]">
                        Max Age
                      </label>
                      <input
                        type="number"
                        placeholder="40"
                        value={filters.ageMax}
                        onChange={(e) =>
                          setFilters({ ...filters, ageMax: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D4AF37]/10 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none text-[#333333] text-sm placeholder:text-[#666666] transition-all duration-300 hover:border-[#D4AF37]/30"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={handleSearch}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#D4AF37] text-white font-light hover:shadow-lg hover:shadow-[#800020]/25 transition-all duration-300"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {!isLoading && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#800020]/10 to-[#D4AF37]/10 border border-[#D4AF37]/20">
                  <span className="text-sm font-light text-[#333333]">
                    {results.length}{" "}
                    {results.length === 1 ? "match" : "matches"} found
                  </span>
                </div>
                {searchTerm && (
                  <div className="px-3 py-1 rounded-full bg-[#F5F5F5] border border-[#D4AF37]/10 text-sm text-[#666666] transition-all duration-300">
                    {searchTerm}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#666666] font-light">
                <span>Popular profiles</span>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 transition-all duration-500">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/20 border-t-[#800020] animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#800020] to-[#D4AF37] animate-pulse"></div>
                </div>
              </div>
              <p className="mt-8 text-[#666666] font-light tracking-wide">
                Finding your perfect matches...
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-[#D4AF37]/10 p-20 text-center transition-all duration-500 hover:shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#800020]/5 to-[#D4AF37]/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#D4AF37]/5 to-[#800020]/5 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-[#800020]/10 to-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 hover:scale-110">
                  <FaSearch className="text-3xl text-[#D4AF37]" />
                </div>
                <h3 className="text-2xl font-light text-[#333333] mb-3">
                  No matches found
                </h3>
                <p className="text-[#666666] max-w-md mx-auto font-light">
                  Try adjusting your search criteria or filters to discover more
                  profiles.
                </p>
                <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
                  <button
                    onClick={() => {
                      sessionStorage.clear();
                      loadProfiles();
                      toast.info("Search results refreshed");
                    }}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#800020] to-[#D4AF37] text-white font-light hover:shadow-lg hover:shadow-[#800020]/25 transition-all duration-300 flex items-center gap-2"
                  >
                    <FaSync className="text-sm transition-all duration-500 hover:rotate-180" />
                    <span>Refresh Results</span>
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-8 py-3 rounded-xl bg-white border border-[#D4AF37]/20 text-[#333333] hover:bg-[#F5F5F5] transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`grid gap-6 transition-all duration-500 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {results.map((profile, index) => {
                const pd = profile.personalDetails || {};
                const name = pd.fullName || "Unknown";
                const age = pd.age || "?";
                const gender = pd.gender || "";
                const location = pd.location || {};
                const city = location.city || "";
                const state = location.state || "";
                const education = pd.education || "";
                const occupation = pd.occupation || "";
                const profileImage = profile.profileImage || null;
                const isHovered = hoveredCard === profile._id;
                // IMPORTANT: Get view count from statistics or viewCount
                const viewCount =
                  profile.statistics?.profileViews || profile.viewCount || 0;
                const gradient = getGradient(name, index);

                return (
                  <div
                    key={profile._id}
                    className="group relative"
                    onMouseEnter={() => setHoveredCard(profile._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div
                      className={`absolute -inset-0.5 bg-gradient-to-r from-[#800020] via-[#D4AF37] to-[#800020] rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500 ${isHovered ? "scale-105" : ""}`}
                    ></div>

                    <div
                      className={`relative bg-white rounded-2xl overflow-hidden border border-[#D4AF37]/10 transition-all duration-500 ${
                        isHovered
                          ? "transform -translate-y-2 shadow-2xl shadow-[#800020]/10 border-[#D4AF37]/30"
                          : "shadow-lg hover:shadow-xl"
                      }`}
                    >
                      <Link
                        to={`/profile/${profile._id}`}
                        className="block"
                        onClick={() => handleProfileView(profile._id)}
                      >
                        {/* Image Section */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F5F5]">
                          {profileImage ? (
                            <div className="w-full h-full relative">
                              <img
                                src={profileImage}
                                alt={name}
                                className={`w-full h-full object-cover transition-all duration-700 ${
                                  isHovered ? "scale-110" : "scale-100"
                                }`}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                            </div>
                          ) : (
                            <div
                              className={`w-full h-full ${gradient} flex items-center justify-center`}
                            >
                              <span className="text-6xl font-light text-white/30">
                                {name.charAt(0)}
                              </span>
                            </div>
                          )}

                          {/* Premium Badge */}
                          <div className="absolute top-3 left-3">
                            <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                              <span className="text-white text-xs font-light tracking-wider">
                                Premium
                              </span>
                            </div>
                          </div>

                          {/* REAL VIEW COUNT - Updated in real-time */}
                          <div className="absolute top-3 right-3">
                            <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                              <FaEye className="text-white/60 text-xs" />
                              <span className="text-white text-xs font-light">
                                {viewCount}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="absolute top-14 right-3 flex flex-col gap-2">
                            <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/40 transition-all duration-300 hover:scale-110">
                              <FaHeart
                                className={`text-white text-base transition-all duration-300 ${
                                  isHovered ? "scale-110" : ""
                                }`}
                              />
                            </button>
                            {userRole === "admin" && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAdminDeleteProfile(profile._id);
                                }}
                                className="w-9 h-9 rounded-full bg-[#800020]/80 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-[#800020] transition-all duration-300 hover:scale-110"
                              >
                                <FaTrash className="text-white text-sm" />
                              </button>
                            )}
                          </div>

                          {/* Profile Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                            <div className="transform transition-all duration-500">
                              <h3 className="text-xl font-light text-white tracking-tight mb-0.5">
                                {name}
                              </h3>
                              <div className="flex items-center gap-3 text-white/80 text-sm font-light">
                                <span>{age} years</span>
                                {gender && (
                                  <>
                                    <span className="w-0.5 h-0.5 rounded-full bg-white/40"></span>
                                    <span>{gender}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Details */}
                        <div className="p-5 transition-all duration-300 group-hover:bg-gradient-to-br from-[#F9F6F0] to-[#FFF9F5]">
                          <div className="space-y-2">
                            {(city || state) && (
                              <div className="flex items-center gap-2 text-sm text-[#666666] transition-colors duration-300 group-hover:text-[#333333]">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#800020]/10 to-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:from-[#800020]/20 group-hover:to-[#D4AF37]/20">
                                  <FaMapMarkerAlt className="text-[#D4AF37] text-xs" />
                                </div>
                                <span className="truncate font-light">
                                  {city}
                                  {city && state ? ", " : ""}
                                  {state}
                                </span>
                              </div>
                            )}
                            {education && (
                              <div className="flex items-center gap-2 text-sm text-[#666666] transition-colors duration-300 group-hover:text-[#333333]">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#800020]/10 to-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:from-[#800020]/20 group-hover:to-[#D4AF37]/20">
                                  <FaGraduationCap className="text-[#800020] text-xs" />
                                </div>
                                <span className="truncate font-light">
                                  {education}
                                </span>
                              </div>
                            )}
                            {occupation && (
                              <div className="flex items-center gap-2 text-sm text-[#666666] transition-colors duration-300 group-hover:text-[#333333]">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#800020]/10 to-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:from-[#800020]/20 group-hover:to-[#D4AF37]/20">
                                  <FaBriefcase className="text-[#D4AF37] text-xs" />
                                </div>
                                <span className="truncate font-light">
                                  {occupation}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Bottom Section */}
                          <div className="mt-4 pt-4 border-t border-[#D4AF37]/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FaEye className="text-[#D4AF37]/40 text-xs" />
                              <span className="text-xs text-[#666666]">
                                {viewCount} views
                              </span>
                            </div>
                            <div className="flex items-center gap-2 transition-all duration-300 group-hover:gap-3">
                              <span className="text-xs font-light text-[#666666] group-hover:text-[#800020] transition-colors duration-300">
                                View Profile
                              </span>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#800020] to-[#D4AF37] flex items-center justify-center text-white text-sm font-light transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg">
                                →
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-2deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
        .animate-slideDown {
          animation: slideDown 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        .animate-spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }

        * {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </Layout>
  );
};

// ==================== MY PROFILE PAGE - WITH DELETE ONLY ====================
const MyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/profiles/my-profile`,
        getHeaders(),
      );
      const data = response.data;
      setProfile(data.profile);
      setUser(data.user);
      setCompletionPercentage(data.completionPercentage || 0);
      setEditData(data.profile);
    } catch (error) {
      console.error("Error loading profile:", error);
      if (error.response?.status === 404) {
        toast.info("Please complete your profile");
      } else {
        toast.error("Failed to load profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleEditClick = () => {
    setEditData(JSON.parse(JSON.stringify(profile)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // ====== DELETE PROFILE ONLY - WITH DOUBLE CONFIRMATION ======
  const handleDeleteProfile = async () => {
    // First confirmation
    if (
      !window.confirm(
        "⚠️ WARNING: Are you sure you want to delete your profile?\n\nThis action CANNOT be undone!",
      )
    ) {
      return;
    }

    // Second confirmation
    if (
      !window.confirm(
        "⚠️ FINAL WARNING: All your data including:\n- Profile information\n- Photos\n- Interests\n- Saved profiles\n\nWILL BE PERMANENTLY DELETED.\n\nAre you absolutely sure?",
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/profiles/delete`, getHeaders());
      toast.success("Profile deleted successfully!");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("userMobile");
      navigate("/login");
    } catch (error) {
      console.error("Delete profile error:", error);
      toast.error(error.response?.data?.message || "Failed to delete profile");
      setIsLoading(false);
    }
  };
  // ====== END DELETE PROFILE ======

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split(".");

    // If it's a checkbox, use 'checked' value, otherwise use 'value'
    const fieldValue = type === "checkbox" ? checked : value;

    setEditData((prev) => {
      let newData = { ...prev };
      let current = newData;

      // Navigate through nested keys (e.g., propertyDetails.hasAgriculturalLand)
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      // Set the value at the final key
      current[keys[keys.length - 1]] = fieldValue;
      return newData;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saveData = {
        personalDetails: {
          fullName: editData.personalDetails?.fullName || "",
          age: parseInt(editData.personalDetails?.age) || 0,
          dateOfBirth: editData.personalDetails?.dateOfBirth || new Date(),
          gender: editData.personalDetails?.gender || "",
          religion: editData.personalDetails?.religion || "",
          caste: editData.personalDetails?.caste || "",
          motherTongue: editData.personalDetails?.motherTongue || "",
          education: editData.personalDetails?.education || "",
          occupation: editData.personalDetails?.occupation || "",
          annualIncome: parseInt(editData.personalDetails?.annualIncome) || 0,
          maritalStatus: editData.personalDetails?.maritalStatus || "",
          height: parseInt(editData.personalDetails?.height) || 0,
          weight: parseInt(editData.personalDetails?.weight) || 0,
          location: {
            state: editData.personalDetails?.location?.state || "",
            city: editData.personalDetails?.location?.city || "",
          },
          aboutMe: editData.personalDetails?.aboutMe || "",
        },
        familyDetails: {
          fatherName: editData.familyDetails?.fatherName || "",
          motherName: editData.familyDetails?.motherName || "",
          brothers: parseInt(editData.familyDetails?.brothers) || 0,
          sisters: parseInt(editData.familyDetails?.sisters) || 0,
          familyBackground: editData.familyDetails?.familyBackground || "",
        },
        partnerPreferences: {
          ageRange: {
            min: parseInt(editData.partnerPreferences?.ageRange?.min) || 18,
            max: parseInt(editData.partnerPreferences?.ageRange?.max) || 40,
          },
          religion: editData.partnerPreferences?.religion || "",
          caste: editData.partnerPreferences?.caste || "",
          education: editData.partnerPreferences?.education || "",
          occupation: editData.partnerPreferences?.occupation || "",
        },
        propertyDetails: {
          hasAgriculturalLand:
            editData.propertyDetails?.hasAgriculturalLand || false,
          agriculturalLandAcres:
            parseInt(editData.propertyDetails?.agriculturalLandAcres) || 0,
          hasResidentialProperty:
            editData.propertyDetails?.hasResidentialProperty || false,
          residentialPropertyDetails:
            editData.propertyDetails?.residentialPropertyDetails || "",
          hasCommercialProperty:
            editData.propertyDetails?.hasCommercialProperty || false,
          commercialPropertyDetails:
            editData.propertyDetails?.commercialPropertyDetails || "",
          otherAssets: editData.propertyDetails?.otherAssets || "",
          propertyDescription:
            editData.propertyDetails?.propertyDescription || "",
        },
        photos: editData.photos || [],
      };

      const response = await axios.post(
        `${API_URL}/profiles/save`,
        saveData,
        getHeaders(),
      );
      toast.success("Profile saved successfully!");
      setProfile(response.data.profile);
      setCompletionPercentage(response.data.completionPercentage);
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        setIsSaving(true);
        const response = await axios.post(
          `${API_URL}/profiles/profile-image`,
          { image: reader.result },
          getHeaders(),
        );
        toast.success("Profile photo updated!");
        setProfile((prev) => ({
          ...prev,
          profileImage: response.data.profileImage,
        }));
        setEditData((prev) => ({
          ...prev,
          profileImage: response.data.profileImage,
        }));
        loadProfile();
      } catch (error) {
        toast.error("Failed to upload photo");
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-dark">
              No Profile Found
            </h2>
            <p className="text-text-light mt-2">Please complete your profile</p>
            <Link
              to="/complete-profile"
              className="btn-maroon inline-block mt-4"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const pd = profile.personalDetails || {};
  const fd = profile.familyDetails || {};
  const pp = profile.partnerPreferences || {};
  const loc = pd.location || {};
  const name = pd.fullName || user?.fullName || "User";
  const photos = profile.photos || [];

  if (isEditing) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-text-dark">
                Edit Profile
              </h1>
              <button
                onClick={handleCancel}
                className="text-text-light hover:text-text-dark"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-premium p-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 flex flex-col items-center mb-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                        {editData.profileImage ? (
                          <img
                            src={editData.profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          name?.charAt(0)?.toUpperCase() || "U"
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={triggerFileUpload}
                        className="absolute bottom-0 right-0 bg-primary-maroon text-white p-2 rounded-full hover:bg-[#600018] transition-colors shadow-lg"
                      >
                        <FaCamera />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleProfileImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <p className="text-text-light text-sm mt-2">
                      Click camera icon to upload photo
                    </p>
                  </div>

                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      name="personalDetails.fullName"
                      value={editData.personalDetails?.fullName || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Age</label>
                    <input
                      name="personalDetails.age"
                      type="number"
                      value={editData.personalDetails?.age || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Gender</label>
                    <select
                      name="personalDetails.gender"
                      value={editData.personalDetails?.gender || ""}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <input
                      name="personalDetails.dateOfBirth"
                      type="date"
                      value={
                        editData.personalDetails?.dateOfBirth?.split("T")[0] ||
                        ""
                      }
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Religion</label>
                    <input
                      name="personalDetails.religion"
                      value={editData.personalDetails?.religion || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Caste</label>
                    <input
                      name="personalDetails.caste"
                      value={editData.personalDetails?.caste || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Mother Tongue</label>
                    <input
                      name="personalDetails.motherTongue"
                      value={editData.personalDetails?.motherTongue || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Education</label>
                    <input
                      name="personalDetails.education"
                      value={editData.personalDetails?.education || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Occupation</label>
                    <input
                      name="personalDetails.occupation"
                      value={editData.personalDetails?.occupation || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Annual Income (INR)</label>
                    <input
                      name="personalDetails.annualIncome"
                      type="number"
                      value={editData.personalDetails?.annualIncome || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Marital Status</label>
                    <select
                      name="personalDetails.maritalStatus"
                      value={editData.personalDetails?.maritalStatus || ""}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Select</option>
                      <option value="unmarried">Unmarried</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                      <option value="separated">Separated</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Height (cm)</label>
                    <input
                      name="personalDetails.height"
                      type="number"
                      value={editData.personalDetails?.height || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Weight (kg)</label>
                    <input
                      name="personalDetails.weight"
                      type="number"
                      value={editData.personalDetails?.weight || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">State</label>
                    <input
                      name="personalDetails.location.state"
                      value={editData.personalDetails?.location?.state || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">City</label>
                    <input
                      name="personalDetails.location.city"
                      value={editData.personalDetails?.location?.city || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">About Me</label>
                    <textarea
                      name="personalDetails.aboutMe"
                      value={editData.personalDetails?.aboutMe || ""}
                      onChange={handleChange}
                      className="form-input"
                      rows="3"
                    />
                  </div>
                  <div className="md:col-span-2 border-t pt-6">
                    <h3 className="text-lg font-semibold text-text-dark mb-4">
                      Family Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Father's Name</label>
                        <input
                          name="familyDetails.fatherName"
                          value={editData.familyDetails?.fatherName || ""}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Mother's Name</label>
                        <input
                          name="familyDetails.motherName"
                          value={editData.familyDetails?.motherName || ""}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Number of Brothers</label>
                        <input
                          name="familyDetails.brothers"
                          type="number"
                          value={editData.familyDetails?.brothers || ""}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Number of Sisters</label>
                        <input
                          name="familyDetails.sisters"
                          type="number"
                          value={editData.familyDetails?.sisters || ""}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Family Background</label>
                        <select
                          name="familyDetails.familyBackground"
                          value={editData.familyDetails?.familyBackground || ""}
                          onChange={handleChange}
                          className="form-input"
                        >
                          <option value="">Select</option>
                          <option value="nuclear">Nuclear</option>
                          <option value="joint">Joint</option>
                          <option value="extended">Extended</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 border-t pt-6">
                    <h3 className="text-lg font-semibold text-text-dark mb-4">
                      Partner Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Min Age</label>
                        <input
                          name="partnerPreferences.ageRange.min"
                          type="number"
                          value={
                            editData.partnerPreferences?.ageRange?.min || ""
                          }
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Max Age</label>
                        <input
                          name="partnerPreferences.ageRange.max"
                          type="number"
                          value={
                            editData.partnerPreferences?.ageRange?.max || ""
                          }
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Preferred Religion</label>
                        <input
                          name="partnerPreferences.religion"
                          value={editData.partnerPreferences?.religion || ""}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Preferred Caste</label>
                        <input
                          name="partnerPreferences.caste"
                          value={editData.partnerPreferences?.caste || ""}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">
                          Preferred Education
                        </label>
                        <input
                          name="partnerPreferences.education"
                          value={editData.partnerPreferences?.education || ""}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">
                          Preferred Occupation
                        </label>
                        <input
                          name="partnerPreferences.occupation"
                          value={editData.partnerPreferences?.occupation || ""}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Details - Edit Mode */}
                  <div className="md:col-span-2 border-t pt-6">
                    <h3 className="text-lg font-semibold text-text-dark mb-4">
                      Property Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Checkbox - uses 'checked' */}
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          name="propertyDetails.hasAgriculturalLand"
                          checked={
                            editData.propertyDetails?.hasAgriculturalLand ||
                            false
                          }
                          onChange={handleChange}
                          className="w-5 h-5"
                        />
                        <label className="form-label mb-0">
                          Has Agricultural Land
                        </label>
                      </div>
                      {/* Text input - uses 'value' */}
                      {editData.propertyDetails?.hasAgriculturalLand && (
                        <div>
                          <label className="form-label">
                            Agricultural Land (acres)
                          </label>
                          <input
                            name="propertyDetails.agriculturalLandAcres"
                            type="number"
                            value={
                              editData.propertyDetails?.agriculturalLandAcres ||
                              ""
                            }
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>
                      )}
                      {/* Checkbox - uses 'checked' */}
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          name="propertyDetails.hasResidentialProperty"
                          checked={
                            editData.propertyDetails?.hasResidentialProperty ||
                            false
                          }
                          onChange={handleChange}
                          className="w-5 h-5"
                        />
                        <label className="form-label mb-0">
                          Has Residential Property
                        </label>
                      </div>
                      {/* Text input - uses 'value' */}
                      {editData.propertyDetails?.hasResidentialProperty && (
                        <div>
                          <label className="form-label">
                            Residential Property Details
                          </label>
                          <input
                            name="propertyDetails.residentialPropertyDetails"
                            value={
                              editData.propertyDetails
                                ?.residentialPropertyDetails || ""
                            }
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>
                      )}
                      {/* Checkbox - uses 'checked' */}
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          name="propertyDetails.hasCommercialProperty"
                          checked={
                            editData.propertyDetails?.hasCommercialProperty ||
                            false
                          }
                          onChange={handleChange}
                          className="w-5 h-5"
                        />
                        <label className="form-label mb-0">
                          Has Commercial Property
                        </label>
                      </div>
                      {/* Text input - uses 'value' */}
                      {editData.propertyDetails?.hasCommercialProperty && (
                        <div>
                          <label className="form-label">
                            Commercial Property Details
                          </label>
                          <input
                            name="propertyDetails.commercialPropertyDetails"
                            value={
                              editData.propertyDetails
                                ?.commercialPropertyDetails || ""
                            }
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>
                      )}
                      {/* Text input - uses 'value' */}
                      <div>
                        <label className="form-label">Other Assets</label>
                        <input
                          name="propertyDetails.otherAssets"
                          value={editData.propertyDetails?.otherAssets || ""}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Any other assets or investments..."
                        />
                      </div>
                      {/* Textarea - uses 'value' */}
                      <div className="md:col-span-2">
                        <label className="form-label">
                          Property Description
                        </label>
                        <textarea
                          name="propertyDetails.propertyDescription"
                          value={
                            editData.propertyDetails?.propertyDescription || ""
                          }
                          onChange={handleChange}
                          className="form-input"
                          rows="2"
                          placeholder="Additional details about properties..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 rounded-xl border-2 border-gray-300 text-text-dark hover:border-primary-maroon transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-maroon flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaSave />
                    )}
                    <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // View Mode - NO HIDE/SHOW, ONLY DELETE
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark">My Profile</h1>
              <p className="text-text-light">View and manage your profile</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleEditClick}
                className="btn-gold flex items-center space-x-2"
              >
                <FaEdit />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={handleDeleteProfile}
                className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <FaTrash />
                <span>Delete Profile</span>
              </button>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-white rounded-2xl shadow-premium p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-dark">
                  Profile Completion
                </h3>
                <p className="text-text-light text-sm">
                  Complete your profile to appear in searches
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-primary-maroon">
                  {completionPercentage}%
                </span>
                {completionPercentage >= 70 && profile?.isPublic ? (
                  <span className="flex items-center text-green-500">
                    <FaCheckCircle className="mr-1" />
                    Public
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-500">
                    <FaTimes className="mr-1" />
                    Private
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div
                className="bg-gradient-to-r from-primary-maroon to-primary-gold h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-text-light">
              {completionPercentage < 70
                ? "Complete your profile to become publicly searchable"
                : profile?.isPublic
                  ? "Your profile is public and searchable"
                  : "Complete your profile to become public"}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Photo */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-premium p-6">
                <div className="relative">
                  <div className="w-full aspect-square rounded-xl overflow-hidden">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PlaceholderImage text={name} className="w-full h-full" />
                    )}
                  </div>
                  <button
                    onClick={triggerFileUpload}
                    className="absolute bottom-4 right-4 bg-primary-maroon text-white p-3 rounded-full hover:bg-[#600018] transition-colors shadow-lg"
                  >
                    <FaCamera />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfileImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-2xl font-bold text-text-dark">{name}</h2>
                  <p className="text-text-light">
                    {pd.age} years • {pd.gender}
                  </p>
                  <p className="text-text-light">
                    {loc.city}
                    {loc.city && loc.state ? ", " : ""}
                    {loc.state}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        profile?.isPublic
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {profile?.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-xl text-center">
                  <p className="text-xs text-blue-600">
                    Click camera icon to change profile photo
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Details */}
              <div className="bg-white rounded-2xl shadow-premium p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <FaCalendar className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Age</p>
                      <p className="text-text-dark font-medium">
                        {pd.age} years
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaUser className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Marital Status</p>
                      <p className="text-text-dark font-medium capitalize">
                        {pd.maritalStatus || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaGraduationCap className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Education</p>
                      <p className="text-text-dark font-medium">
                        {pd.education || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaBriefcase className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Occupation</p>
                      <p className="text-text-dark font-medium">
                        {pd.occupation || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaMoneyBillWave className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Annual Income</p>
                      <p className="text-text-dark font-medium">
                        ₹{pd.annualIncome?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaRulerVertical className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Height</p>
                      <p className="text-text-dark font-medium">
                        {pd.height} cm
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaWeight className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Weight</p>
                      <p className="text-text-dark font-medium">
                        {pd.weight} kg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaMapMarkerAlt className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Location</p>
                      <p className="text-text-dark font-medium">
                        {loc.city}
                        {loc.city && loc.state ? ", " : ""}
                        {loc.state}
                      </p>
                    </div>
                  </div>
                </div>
                {pd.aboutMe && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-text-light text-sm">About Me</p>
                    <p className="text-text-dark">{pd.aboutMe}</p>
                  </div>
                )}
              </div>

              {/* Family Details */}
              <div className="bg-white rounded-2xl shadow-premium p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  Family Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-light text-sm">Father's Name</p>
                    <p className="text-text-dark font-medium">
                      {fd.fatherName || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Mother's Name</p>
                    <p className="text-text-dark font-medium">
                      {fd.motherName || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Brothers</p>
                    <p className="text-text-dark font-medium">
                      {fd.brothers || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Sisters</p>
                    <p className="text-text-dark font-medium">
                      {fd.sisters || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Family Background</p>
                    <p className="text-text-dark font-medium capitalize">
                      {fd.familyBackground || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Partner Preferences */}
              <div className="bg-white rounded-2xl shadow-premium p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  Partner Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-light text-sm">Age Range</p>
                    <p className="text-text-dark font-medium">
                      {pp.ageRange?.min || "?"} - {pp.ageRange?.max || "?"}{" "}
                      years
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Religion</p>
                    <p className="text-text-dark font-medium">
                      {pp.religion || "Any"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Caste</p>
                    <p className="text-text-dark font-medium">
                      {pp.caste || "Any"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Education</p>
                    <p className="text-text-dark font-medium">
                      {pp.education || "Any"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Occupation</p>
                    <p className="text-text-dark font-medium">
                      {pp.occupation || "Any"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Details - Display */}
              {(profile.propertyDetails?.hasAgriculturalLand ||
                profile.propertyDetails?.hasResidentialProperty ||
                profile.propertyDetails?.hasCommercialProperty ||
                profile.propertyDetails?.otherAssets) && (
                <div className="bg-white rounded-2xl shadow-premium p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <FaHome className="text-primary-gold" />
                    Property Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.propertyDetails?.hasAgriculturalLand && (
                      <div>
                        <p className="text-text-light text-sm">
                          Agricultural Land
                        </p>
                        <p className="text-text-dark font-medium">
                          {profile.propertyDetails?.agriculturalLandAcres || 0}{" "}
                          acres
                        </p>
                      </div>
                    )}
                    {profile.propertyDetails?.hasResidentialProperty && (
                      <div>
                        <p className="text-text-light text-sm">
                          Residential Property
                        </p>
                        <p className="text-text-dark font-medium">
                          {profile.propertyDetails
                            ?.residentialPropertyDetails || "Yes"}
                        </p>
                      </div>
                    )}
                    {profile.propertyDetails?.hasCommercialProperty && (
                      <div>
                        <p className="text-text-light text-sm">
                          Commercial Property
                        </p>
                        <p className="text-text-dark font-medium">
                          {profile.propertyDetails?.commercialPropertyDetails ||
                            "Yes"}
                        </p>
                      </div>
                    )}
                    {profile.propertyDetails?.otherAssets && (
                      <div>
                        <p className="text-text-light text-sm">Other Assets</p>
                        <p className="text-text-dark font-medium">
                          {profile.propertyDetails?.otherAssets}
                        </p>
                      </div>
                    )}
                    {profile.propertyDetails?.propertyDescription && (
                      <div className="md:col-span-2">
                        <p className="text-text-light text-sm">
                          Property Description
                        </p>
                        <p className="text-text-dark font-medium">
                          {profile.propertyDetails?.propertyDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Photos Gallery */}
              {photos && photos.length > 0 && (
                <div className="bg-white rounded-2xl shadow-premium p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4">
                    Photos ({photos.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={photo._id || index} className="relative group">
                        <img
                          src={photo.url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-40 object-cover rounded-xl hover:shadow-lg transition-shadow"
                        />
                        {photo.isProfilePicture && (
                          <div className="absolute top-2 left-2 bg-primary-gold text-white text-xs px-2 py-1 rounded-full">
                            Profile
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-text-light text-sm mt-4 text-center">
                    {photos.length} photo{photos.length > 1 ? "s" : ""} uploaded
                  </p>
                </div>
              )}

              {(!photos || photos.length === 0) && (
                <div className="bg-white rounded-2xl shadow-premium p-6 text-center">
                  <FaCamera className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-text-light">No photos uploaded yet</p>
                  <Link
                    to="/complete-profile"
                    className="text-primary-maroon text-sm hover:underline"
                  >
                    Add photos
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// ==================== VIEW PROFILE PAGE ====================
const ViewProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [showInterestPopup, setShowInterestPopup] = useState(false);
  const [isSendingInterest, setIsSendingInterest] = useState(false);
  const autoPlayRef = useRef(null);
  const viewTrackedRef = useRef(false);

  // Load profile and track view
  useEffect(() => {
    if (id) {
      loadProfile();
      checkIfSaved();
      // Track view when profile loads (only once)
      if (!viewTrackedRef.current) {
        trackProfileView();
        viewTrackedRef.current = true;
      }
    }
  }, [id]);

  // Auto-play for photos
  useEffect(() => {
    if (isAutoPlay && profile?.profile?.photos?.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setTransitioning(true);
        setTimeout(() => {
          setCurrentPhotoIndex(
            (prev) => (prev + 1) % profile.profile.photos.length,
          );
          setTimeout(() => setTransitioning(false), 200);
        }, 300);
      }, 4000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlay, profile]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/profiles/${id}`,
        getHeaders(),
      );
      setProfile(response.data);
      setIsOwner(response.data.isOwner || false);

      // Set view count from profile data
      if (response.data.profile?.statistics?.profileViews !== undefined) {
        setViewCount(response.data.profile.statistics.profileViews);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const trackProfileView = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/profiles/${id}/view`,
        {},
        getHeaders(),
      );
      if (response.data && response.data.viewCount !== undefined) {
        setViewCount(response.data.viewCount);

        // Update the profile object with new view count
        setProfile((prev) => {
          if (prev) {
            return {
              ...prev,
              profile: {
                ...prev.profile,
                statistics: {
                  ...prev.profile?.statistics,
                  profileViews: response.data.viewCount,
                },
              },
            };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/profiles/saved/list`,
        getHeaders(),
      );
      const savedProfiles = response.data.profiles || [];
      const isProfileSaved = savedProfiles.some((p) => p._id === id);
      setIsSaved(isProfileSaved);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSendInterest = async () => {
    setIsSendingInterest(true);
    try {
      await axios.post(
        `${API_URL}/interests/send`,
        {
          receiverId: profile?.profile?.userId,
          message: "I am interested in this profile",
        },
        getHeaders(),
      );

      // Show the interest popup immediately after successful interest send
      setShowInterestPopup(true);
      toast.success("Interest sent successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send interest");
    } finally {
      setIsSendingInterest(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/profiles/save-favorite`,
        { profileId: id },
        getHeaders(),
      );

      if (response.data.saved) {
        setIsSaved(true);
        toast.success("Profile saved to favorites!");
      } else {
        setIsSaved(false);
        toast.info("Profile removed from favorites");
      }
    } catch (error) {
      console.error("Save profile error:", error);
      toast.error(error.response?.data?.message || "Failed to save profile");
    }
  };

  const goToPhoto = (index) => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentPhotoIndex(index);
      setTimeout(() => setTransitioning(false), 200);
    }, 300);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 5000);
  };

  const nextPhoto = () => {
    if (profile?.profile?.photos?.length > 0) {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentPhotoIndex(
          (prev) => (prev + 1) % profile.profile.photos.length,
        );
        setTimeout(() => setTransitioning(false), 200);
      }, 300);
    }
  };

  const prevPhoto = () => {
    if (profile?.profile?.photos?.length > 0) {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentPhotoIndex((prev) =>
          prev === 0 ? profile.profile.photos.length - 1 : prev - 1,
        );
        setTimeout(() => setTransitioning(false), 200);
      }, 300);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!profile || !profile.profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-dark">
              Profile Not Found
            </h2>
            <p className="text-text-light mt-2">
              The profile you're looking for doesn't exist.
            </p>
            <Link to="/search" className="btn-maroon inline-block mt-4">
              Go to Search
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const p = profile.profile;
  const pd = p.personalDetails || {};
  const fd = p.familyDetails || {};
  const pp = p.partnerPreferences || {};
  const loc = pd.location || {};
  const name = pd.fullName || "Unknown";
  const photos = p.photos || [];

  // Broker contact details
  const brokerPhone = "+919110480411";
  const brokerWhatsApp = "918123427060";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <button
            onClick={() => window.history.back()}
            className="text-text-dark hover:text-primary-maroon mb-6 flex items-center space-x-2 transition-all hover:translate-x-[-4px]"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Photo - Static */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-premium p-6 sticky top-24">
                <div className="w-full aspect-square rounded-xl overflow-hidden shadow-lg relative">
                  {p.profileImage ? (
                    <img
                      src={p.profileImage}
                      alt={name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <PlaceholderImage text={name} className="w-full h-full" />
                  )}

                  {/* Real-time View Count Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                      <FaEye className="text-white/70 text-xs" />
                      <span className="text-white text-xs font-light">
                        {viewCount}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-2xl font-bold text-text-dark">{name}</h2>
                  <p className="text-text-light">
                    {pd.age} years • {pd.gender}
                  </p>
                  <p className="text-text-light">
                    {loc.city}
                    {loc.city && loc.state ? ", " : ""}
                    {loc.state}
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-2 text-xs text-text-light">
                    <FaEye className="text-primary-maroon/60" />
                    <span>{viewCount} profile views</span>
                  </div>
                </div>

                {!isOwner && (
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleSendInterest}
                      disabled={isSendingInterest}
                      className="btn-maroon w-full flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingInterest ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaHeart />
                      )}
                      <span>
                        {isSendingInterest ? "Sending..." : "Send Interest"}
                      </span>
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                        isSaved
                          ? "bg-primary-maroon text-white hover:bg-[#600018]"
                          : "btn-gold"
                      }`}
                    >
                      <FaHeart />
                      <span>{isSaved ? "Saved" : "Save Profile"}</span>
                    </button>
                  </div>
                )}

                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-text-light text-center">
                    {isOwner
                      ? "This is your profile"
                      : "Contact details are hidden. Send interest to connect through broker."}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Details */}
              <div className="bg-white rounded-2xl shadow-premium p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <FaCalendar className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Age</p>
                      <p className="text-text-dark font-medium">
                        {pd.age} years
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaUser className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Marital Status</p>
                      <p className="text-text-dark font-medium capitalize">
                        {pd.maritalStatus || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaGraduationCap className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Education</p>
                      <p className="text-text-dark font-medium">
                        {pd.education || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaBriefcase className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Occupation</p>
                      <p className="text-text-dark font-medium">
                        {pd.occupation || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaMoneyBillWave className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Annual Income</p>
                      <p className="text-text-dark font-medium">
                        ₹{pd.annualIncome?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaRulerVertical className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Height</p>
                      <p className="text-text-dark font-medium">
                        {pd.height} cm
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaWeight className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Weight</p>
                      <p className="text-text-dark font-medium">
                        {pd.weight} kg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaMapMarkerAlt className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Location</p>
                      <p className="text-text-dark font-medium">
                        {loc.city}
                        {loc.city && loc.state ? ", " : ""}
                        {loc.state}
                      </p>
                    </div>
                  </div>
                </div>
                {pd.aboutMe && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-text-light text-sm">About Me</p>
                    <p className="text-text-dark">{pd.aboutMe}</p>
                  </div>
                )}
              </div>

              {/* Family Details */}
              <div className="bg-white rounded-2xl shadow-premium p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  Family Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-light text-sm">Father's Name</p>
                    <p className="text-text-dark font-medium">
                      {fd.fatherName || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Mother's Name</p>
                    <p className="text-text-dark font-medium">
                      {fd.motherName || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Brothers</p>
                    <p className="text-text-dark font-medium">
                      {fd.brothers || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Sisters</p>
                    <p className="text-text-dark font-medium">
                      {fd.sisters || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Family Background</p>
                    <p className="text-text-dark font-medium capitalize">
                      {fd.familyBackground || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Partner Preferences */}
              <div className="bg-white rounded-2xl shadow-premium p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  Partner Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-light text-sm">Age Range</p>
                    <p className="text-text-dark font-medium">
                      {pp.ageRange?.min || "?"} - {pp.ageRange?.max || "?"}{" "}
                      years
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Religion</p>
                    <p className="text-text-dark font-medium">
                      {pp.religion || "Any"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Caste</p>
                    <p className="text-text-dark font-medium">
                      {pp.caste || "Any"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Education</p>
                    <p className="text-text-dark font-medium">
                      {pp.education || "Any"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Occupation</p>
                    <p className="text-text-dark font-medium">
                      {pp.occupation || "Any"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              {(p.propertyDetails?.hasAgriculturalLand ||
                p.propertyDetails?.hasResidentialProperty ||
                p.propertyDetails?.hasCommercialProperty ||
                p.propertyDetails?.otherAssets) && (
                <div className="bg-white rounded-2xl shadow-premium p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <FaHome className="text-primary-gold" />
                    Property Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p.propertyDetails?.hasAgriculturalLand && (
                      <div>
                        <p className="text-text-light text-sm">
                          Agricultural Land
                        </p>
                        <p className="text-text-dark font-medium">
                          {p.propertyDetails?.agriculturalLandAcres || 0} acres
                        </p>
                      </div>
                    )}
                    {p.propertyDetails?.hasResidentialProperty && (
                      <div>
                        <p className="text-text-light text-sm">
                          Residential Property
                        </p>
                        <p className="text-text-dark font-medium">
                          {p.propertyDetails?.residentialPropertyDetails ||
                            "Yes"}
                        </p>
                      </div>
                    )}
                    {p.propertyDetails?.hasCommercialProperty && (
                      <div>
                        <p className="text-text-light text-sm">
                          Commercial Property
                        </p>
                        <p className="text-text-dark font-medium">
                          {p.propertyDetails?.commercialPropertyDetails ||
                            "Yes"}
                        </p>
                      </div>
                    )}
                    {p.propertyDetails?.otherAssets && (
                      <div>
                        <p className="text-text-light text-sm">Other Assets</p>
                        <p className="text-text-dark font-medium">
                          {p.propertyDetails?.otherAssets}
                        </p>
                      </div>
                    )}
                    {p.propertyDetails?.propertyDescription && (
                      <div className="md:col-span-2">
                        <p className="text-text-light text-sm">
                          Property Description
                        </p>
                        <p className="text-text-dark font-medium">
                          {p.propertyDetails?.propertyDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Photos Gallery with Slideshow */}
              {photos && photos.length > 0 && (
                <div className="bg-white rounded-2xl shadow-premium p-6 overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-dark flex items-center space-x-2">
                      <span>Memories</span>
                      <span className="text-sm text-text-light font-normal">
                        ({photos.length} photo{photos.length > 1 ? "s" : ""})
                      </span>
                    </h3>
                    {photos.length > 1 && (
                      <button
                        onClick={() => setIsAutoPlay(!isAutoPlay)}
                        className="text-sm text-primary-maroon hover:underline flex items-center space-x-1.5 transition-all hover:scale-105"
                      >
                        {isAutoPlay ? (
                          <>
                            <FaClock className="text-xs" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <FaPlay className="text-xs" />
                            <span>Play</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Main Slideshow Image */}
                  <div
                    className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-700 shadow-2xl"
                    style={{ height: "450px" }}
                  >
                    <div
                      className={`w-full h-full transition-all duration-700 ease-in-out ${
                        transitioning
                          ? "scale-105 opacity-70"
                          : "scale-100 opacity-100"
                      }`}
                    >
                      <img
                        src={photos[currentPhotoIndex]?.url}
                        alt={`Photo ${currentPhotoIndex + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>

                    {photos.length > 1 && (
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-sm px-5 py-2 rounded-full border border-white/10">
                        <span className="font-light">
                          {currentPhotoIndex + 1}
                        </span>
                        <span className="text-white/50 mx-2">/</span>
                        <span className="font-light">{photos.length}</span>
                      </div>
                    )}

                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/60 transition-all duration-300 hover:scale-110 hover:shadow-xl border border-white/10"
                        >
                          <FaArrowLeft className="text-lg" />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/60 transition-all duration-300 hover:scale-110 hover:shadow-xl border border-white/10"
                        >
                          <FaArrowRight className="text-lg" />
                        </button>
                      </>
                    )}

                    {photos.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center space-x-1.5 border border-white/10">
                        <span className="text-white/70">Auto</span>
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isAutoPlay ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                        ></div>
                      </div>
                    )}

                    {photos.length > 1 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-primary-gold to-primary-maroon transition-all duration-300"
                          style={{
                            width: `${((currentPhotoIndex + 1) / photos.length) * 100}%`,
                            transition: isAutoPlay
                              ? "width 4s linear"
                              : "width 0.3s ease",
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {photos.length > 1 && (
                    <div className="mt-5 flex justify-center space-x-3 overflow-x-auto pb-2 px-2">
                      {photos.map((photo, index) => (
                        <button
                          key={photo._id || index}
                          onClick={() => goToPhoto(index)}
                          className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                            currentPhotoIndex === index
                              ? "border-primary-gold shadow-lg shadow-primary-gold/20 scale-110"
                              : "border-gray-200 hover:border-gray-400 hover:scale-105"
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(!photos || photos.length === 0) && (
                <div className="bg-white rounded-2xl shadow-premium p-8 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCamera className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-text-light">No photos uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Gallery Modal */}
      {showGalleryModal && photos.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in">
          <button
            onClick={() => setShowGalleryModal(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl transition-all hover:scale-110 hover:rotate-90 duration-300"
          >
            <FaTimes />
          </button>
          <div className="relative max-w-5xl w-full">
            <div
              className={`transition-all duration-700 ${transitioning ? "scale-95 opacity-50" : "scale-100 opacity-100"}`}
            >
              <img
                src={photos[currentPhotoIndex]?.url}
                alt={`Photo ${currentPhotoIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-4 rounded-full hover:bg-black/70 transition-all hover:scale-110 border border-white/10"
                >
                  <FaArrowLeft className="text-2xl" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-4 rounded-full hover:bg-black/70 transition-all hover:scale-110 border border-white/10"
                >
                  <FaArrowRight className="text-2xl" />
                </button>
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-sm px-5 py-2 rounded-full border border-white/10">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== INTEREST POPUP MODAL ===== */}
      {showInterestPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl transform transition-all duration-500 scale-100 animate-slide-up">
            {/* Close button */}
            <button
              onClick={() => setShowInterestPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <FaHeart className="text-4xl text-primary-maroon animate-pulse" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-text-dark mb-2">
                Interest Sent! ❤️
              </h3>
              <p className="text-text-light text-sm">
                Your interest has been sent to{" "}
                <span className="font-semibold text-text-dark">{name}</span>.
                The broker will facilitate the connection.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-sm text-text-light text-center mb-4">
                Contact the broker to discuss this profile:
              </p>
              <div className="flex flex-col gap-3">
                {/* Call Broker Button */}
                <a
                  href={`tel:${brokerPhone}`}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-primary-maroon text-white rounded-xl hover:bg-[#600018] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <FaPhone className="text-lg" />
                  <span className="font-medium">Call Broker</span>
                </a>

                {/* WhatsApp Broker Button */}
                <a
                  href={`https://wa.me/${brokerWhatsApp}?text=${encodeURIComponent(
                    `Hi, I am interested in the profile of ${name} (Profile ID: ${id}). Please help me connect with them.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-[#25D366] text-white rounded-xl hover:bg-[#1DA851] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <FaWhatsapp className="text-lg" />
                  <span className="font-medium">Chat on WhatsApp</span>
                </a>

                {/* Continue Browsing Button */}
                <button
                  onClick={() => {
                    setShowInterestPopup(false);
                    navigate("/search");
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-text-dark rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  <span>Continue Browsing</span>
                  <FaArrowRight className="text-sm" />
                </button>
              </div>
            </div>

            <p className="text-xs text-text-light text-center mt-4">
              The broker will assist you with the matchmaking process.
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

// ==================== INTERESTS PAGE ====================
const InterestsPage = () => {
  const [activeTab, setActiveTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInterests();
  }, [activeTab]);

  const loadInterests = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "received") {
        const response = await axios.get(
          `${API_URL}/interests/received`,
          getHeaders(),
        );
        setReceived(response.data.interests || []);
      } else {
        const response = await axios.get(
          `${API_URL}/interests/sent`,
          getHeaders(),
        );
        setSent(response.data.interests || []);
      }
    } catch (error) {
      console.error("Error loading interests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (interestId) => {
    try {
      await axios.put(
        `${API_URL}/interests/${interestId}/accept`,
        {},
        getHeaders(),
      );
      toast.success("Interest accepted!");
      loadInterests();
    } catch (error) {
      console.error("Accept error:", error);
      toast.error(error.response?.data?.message || "Failed to accept interest");
    }
  };

  const handleReject = async (interestId) => {
    try {
      await axios.put(
        `${API_URL}/interests/${interestId}/reject`,
        {},
        getHeaders(),
      );
      toast.info("Interest rejected");
      loadInterests();
    } catch (error) {
      console.error("Reject error:", error);
      toast.error(error.response?.data?.message || "Failed to reject interest");
    }
  };

  const handleCancel = async (interestId) => {
    try {
      await axios.delete(
        `${API_URL}/interests/${interestId}/cancel`,
        getHeaders(),
      );
      toast.info("Interest cancelled");
      loadInterests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel interest");
    }
  };

  const interests = activeTab === "received" ? received : sent;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-text-dark mb-8">
            My Interests
          </h1>

          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab("received")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "received"
                  ? "bg-primary-maroon text-white"
                  : "bg-white text-text-dark hover:bg-gray-50"
              }`}
            >
              Received ({received.length})
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "sent"
                  ? "bg-primary-maroon text-white"
                  : "bg-white text-text-dark hover:bg-gray-50"
              }`}
            >
              Sent ({sent.length})
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
            </div>
          ) : interests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
              <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark">
                No Interests
              </h3>
              <p className="text-text-light">
                You have no {activeTab} interests at the moment.
              </p>
              <Link to="/search" className="btn-maroon inline-block mt-4">
                Browse Profiles
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {interests.map((interest) => {
                const user =
                  activeTab === "received"
                    ? interest.senderId
                    : interest.receiverId;
                const userId = user?._id || user;

                return (
                  <div
                    key={interest._id}
                    className="bg-white rounded-2xl shadow-premium p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          to={`/profile/${userId}`}
                          className="text-lg font-semibold text-text-dark hover:text-primary-maroon hover:underline"
                        >
                          {user?.fullName || "Unknown"}
                        </Link>
                        <p className="text-text-light text-sm mt-2">
                          <FaCalendar className="inline mr-1" />
                          {new Date(interest.createdAt).toLocaleDateString()}
                        </p>
                        {interest.message && (
                          <p className="text-text-dark text-sm mt-1 italic">
                            "{interest.message}"
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          interest.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : interest.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : interest.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {interest.status}
                      </span>
                    </div>
                    {interest.status === "pending" &&
                      activeTab === "received" && (
                        <div className="mt-4 flex space-x-3 flex-wrap gap-2">
                          <button
                            onClick={() => handleAccept(interest._id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                          >
                            <FaCheckCircle />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleReject(interest._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                          >
                            <FaTimes />
                            <span>Reject</span>
                          </button>
                          <Link
                            to={`/profile/${userId}`}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                          >
                            <FaUser />
                            <span>View Profile</span>
                          </Link>
                        </div>
                      )}
                    {interest.status === "pending" && activeTab === "sent" && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleCancel(interest._id)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel Interest
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// ==================== SAVED PROFILES PAGE ====================
const SavedProfilesPage = () => {
  const [saved, setSaved] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/profiles/saved/list`,
        getHeaders(),
      );
      setSaved(response.data.profiles || []);
    } catch (error) {
      console.error("Error loading saved profiles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center space-x-3 mb-8">
            <FaHeart className="text-3xl text-primary-maroon" />
            <h1 className="text-3xl font-bold text-text-dark">
              Saved Profiles
            </h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
            </div>
          ) : saved.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
              <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark">
                No Saved Profiles
              </h3>
              <p className="text-text-light">
                Start saving profiles you're interested in.
              </p>
              <Link to="/search" className="btn-maroon inline-block mt-4">
                Browse Profiles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {saved.map((profile) => {
                const pd = profile.personalDetails || {};
                const name = pd.fullName || "Unknown";
                const loc = pd.location || {};
                const city = loc.city || "";
                const state = loc.state || "";
                const profileImage = profile.profileImage || null;

                return (
                  <Link to={`/profile/${profile._id}`} key={profile._id}>
                    <div className="bg-white rounded-2xl shadow-premium overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="relative h-48">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <PlaceholderImage
                            text={name}
                            className="w-full h-full"
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-primary-maroon text-white p-2 rounded-full">
                          <FaHeart />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-text-dark">
                          {name}
                        </h3>
                        <p className="text-text-light text-sm">
                          {pd.age || "?"} years
                        </p>
                        <p className="text-text-light text-sm">
                          {city}
                          {city && state ? ", " : ""}
                          {state}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// ==================== PROFILE COMPLETION PAGE ====================
const ProfileCompletionPage = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    personalDetails: {
      fullName: "",
      age: "",
      dateOfBirth: "",
      gender: "",
      religion: "",
      caste: "",
      motherTongue: "",
      education: "",
      occupation: "",
      annualIncome: "",
      maritalStatus: "",
      height: "",
      weight: "",
      location: { state: "", city: "" },
      aboutMe: "",
    },
    familyDetails: {
      fatherName: "",
      motherName: "",
      brothers: 0,
      sisters: 0,
      familyBackground: "",
    },
    partnerPreferences: {
      ageRange: { min: "", max: "" },
      religion: "",
      caste: "",
      education: "",
      occupation: "",
    },
    propertyDetails: {
      hasAgriculturalLand: false,
      agriculturalLandAcres: "",
      hasResidentialProperty: false,
      residentialPropertyDetails: "",
      hasCommercialProperty: false,
      commercialPropertyDetails: "",
      otherAssets: "",
      propertyDescription: "",
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split(".");
    setFormData((prev) => {
      let newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = type === "checkbox" ? checked : value;
      return newData;
    });
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalPhotos = selectedPhotos.length + files.length;
    if (totalPhotos > 4) {
      toast.error("You can upload a maximum of 4 photos only!");
      return;
    }

    setIsUploading(true);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((results) => {
        setSelectedPhotos((prev) => [...prev, ...results]);
        setIsUploading(false);
        toast.success(`${results.length} photo(s) selected`);
      })
      .catch((err) => {
        console.error("Error reading files:", err);
        toast.error("Failed to read photos");
        setIsUploading(false);
      });
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = (index) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      let uploadedPhotos = [];

      if (selectedPhotos.length > 0) {
        try {
          const response = await axios.post(
            `${API_URL}/profiles/photos`,
            { photos: selectedPhotos },
            getHeaders(),
          );
          if (response.data && response.data.photos) {
            uploadedPhotos = response.data.photos;
            toast.success(`Uploaded ${uploadedPhotos.length} photos`);
          }
        } catch (photoError) {
          console.error("Photo upload error:", photoError);
          toast.error("Failed to upload photos. Please try again.");
          setIsSaving(false);
          return;
        }
      }

      const saveData = {
        personalDetails: {
          fullName: formData.personalDetails.fullName || "User",
          age: parseInt(formData.personalDetails.age) || 25,
          dateOfBirth: formData.personalDetails.dateOfBirth || "1999-01-01",
          gender: formData.personalDetails.gender || "male",
          religion: formData.personalDetails.religion || "Hindu",
          caste: formData.personalDetails.caste || "General",
          motherTongue: formData.personalDetails.motherTongue || "English",
          education: formData.personalDetails.education || "Bachelor's Degree",
          occupation:
            formData.personalDetails.occupation || "Software Engineer",
          annualIncome:
            parseInt(formData.personalDetails.annualIncome) || 500000,
          maritalStatus: formData.personalDetails.maritalStatus || "unmarried",
          height: parseInt(formData.personalDetails.height) || 170,
          weight: parseInt(formData.personalDetails.weight) || 70,
          location: {
            state: formData.personalDetails.location.state || "Karnataka",
            city: formData.personalDetails.location.city || "Bidar",
          },
          aboutMe:
            formData.personalDetails.aboutMe || "Looking for a life partner.",
        },
        familyDetails: {
          fatherName: formData.familyDetails.fatherName || "Father Name",
          motherName: formData.familyDetails.motherName || "Mother Name",
          brothers: parseInt(formData.familyDetails.brothers) || 0,
          sisters: parseInt(formData.familyDetails.sisters) || 0,
          familyBackground:
            formData.familyDetails.familyBackground || "nuclear",
        },
        partnerPreferences: {
          ageRange: {
            min: parseInt(formData.partnerPreferences.ageRange.min) || 22,
            max: parseInt(formData.partnerPreferences.ageRange.max) || 35,
          },
          religion: formData.partnerPreferences.religion || "Any",
          caste: formData.partnerPreferences.caste || "Any",
          education:
            formData.partnerPreferences.education || "Bachelor's Degree",
          occupation: formData.partnerPreferences.occupation || "Any",
        },
        propertyDetails: {
          hasAgriculturalLand:
            formData.propertyDetails.hasAgriculturalLand || false,
          agriculturalLandAcres:
            parseInt(formData.propertyDetails.agriculturalLandAcres) || 0,
          hasResidentialProperty:
            formData.propertyDetails.hasResidentialProperty || false,
          residentialPropertyDetails:
            formData.propertyDetails.residentialPropertyDetails || "",
          hasCommercialProperty:
            formData.propertyDetails.hasCommercialProperty || false,
          commercialPropertyDetails:
            formData.propertyDetails.commercialPropertyDetails || "",
          otherAssets: formData.propertyDetails.otherAssets || "",
          propertyDescription:
            formData.propertyDetails.propertyDescription || "",
        },
        photos: uploadedPhotos,
      };

      const response = await axios.post(
        `${API_URL}/profiles/save`,
        saveData,
        getHeaders(),
      );

      console.log("✅ Profile saved:", response.data);

      if (response.data.isPublic) {
        toast.success("Profile completed and is now public!");
      } else {
        toast.info(
          "Profile saved. Complete all fields and add a photo to become public.",
        );
      }

      window.location.href = "/my-profile";
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    const pd = formData.personalDetails;
    const fd = formData.familyDetails;
    const pp = formData.partnerPreferences;
    const prop = formData.propertyDetails;

    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-bold text-text-dark mb-4">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  name="personalDetails.fullName"
                  value={pd.fullName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Age *</label>
                <input
                  name="personalDetails.age"
                  type="number"
                  value={pd.age}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Date of Birth *</label>
                <input
                  name="personalDetails.dateOfBirth"
                  type="date"
                  value={pd.dateOfBirth}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Gender *</label>
                <select
                  name="personalDetails.gender"
                  value={pd.gender}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Religion *</label>
                <input
                  name="personalDetails.religion"
                  value={pd.religion}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Caste *</label>
                <input
                  name="personalDetails.caste"
                  value={pd.caste}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Mother Tongue *</label>
                <input
                  name="personalDetails.motherTongue"
                  value={pd.motherTongue}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Education *</label>
                <input
                  name="personalDetails.education"
                  value={pd.education}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Occupation *</label>
                <input
                  name="personalDetails.occupation"
                  value={pd.occupation}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Annual Income (INR) *</label>
                <input
                  name="personalDetails.annualIncome"
                  type="number"
                  value={pd.annualIncome}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Marital Status *</label>
                <select
                  name="personalDetails.maritalStatus"
                  value={pd.maritalStatus}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select</option>
                  <option value="unmarried">Unmarried</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
              </div>
              <div>
                <label className="form-label">Height (cm) *</label>
                <input
                  name="personalDetails.height"
                  type="number"
                  value={pd.height}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Weight (kg) *</label>
                <input
                  name="personalDetails.weight"
                  type="number"
                  value={pd.weight}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">State *</label>
                <input
                  name="personalDetails.location.state"
                  value={pd.location.state}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">City *</label>
                <input
                  name="personalDetails.location.city"
                  value={pd.location.city}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="form-label">About Me</label>
                <textarea
                  name="personalDetails.aboutMe"
                  value={pd.aboutMe}
                  onChange={handleChange}
                  className="form-input"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-xl font-bold text-text-dark mb-4">
              Family Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Father's Name *</label>
                <input
                  name="familyDetails.fatherName"
                  value={fd.fatherName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Mother's Name *</label>
                <input
                  name="familyDetails.motherName"
                  value={fd.motherName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Number of Brothers</label>
                <input
                  name="familyDetails.brothers"
                  type="number"
                  value={fd.brothers}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Number of Sisters</label>
                <input
                  name="familyDetails.sisters"
                  type="number"
                  value={fd.sisters}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Family Background *</label>
                <select
                  name="familyDetails.familyBackground"
                  value={fd.familyBackground}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select</option>
                  <option value="nuclear">Nuclear</option>
                  <option value="joint">Joint</option>
                  <option value="extended">Extended</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-xl font-bold text-text-dark mb-4">
              Partner Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Minimum Age *</label>
                <input
                  name="partnerPreferences.ageRange.min"
                  type="number"
                  value={pp.ageRange.min}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Maximum Age *</label>
                <input
                  name="partnerPreferences.ageRange.max"
                  type="number"
                  value={pp.ageRange.max}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Preferred Religion *</label>
                <input
                  name="partnerPreferences.religion"
                  value={pp.religion}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Preferred Caste *</label>
                <input
                  name="partnerPreferences.caste"
                  value={pp.caste}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Preferred Education *</label>
                <input
                  name="partnerPreferences.education"
                  value={pp.education}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Preferred Occupation *</label>
                <input
                  name="partnerPreferences.occupation"
                  value={pp.occupation}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-xl font-bold text-text-dark mb-4">
              Property Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  name="propertyDetails.hasAgriculturalLand"
                  checked={prop.hasAgriculturalLand}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <label className="form-label mb-0">Has Agricultural Land</label>
              </div>
              {prop.hasAgriculturalLand && (
                <div>
                  <label className="form-label">
                    Agricultural Land (acres)
                  </label>
                  <input
                    name="propertyDetails.agriculturalLandAcres"
                    type="number"
                    value={prop.agriculturalLandAcres}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              )}
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  name="propertyDetails.hasResidentialProperty"
                  checked={prop.hasResidentialProperty}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <label className="form-label mb-0">
                  Has Residential Property
                </label>
              </div>
              {prop.hasResidentialProperty && (
                <div>
                  <label className="form-label">
                    Residential Property Details
                  </label>
                  <textarea
                    name="propertyDetails.residentialPropertyDetails"
                    value={prop.residentialPropertyDetails}
                    onChange={handleChange}
                    className="form-input"
                    rows="2"
                  />
                </div>
              )}
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  name="propertyDetails.hasCommercialProperty"
                  checked={prop.hasCommercialProperty}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <label className="form-label mb-0">
                  Has Commercial Property
                </label>
              </div>
              {prop.hasCommercialProperty && (
                <div>
                  <label className="form-label">
                    Commercial Property Details
                  </label>
                  <textarea
                    name="propertyDetails.commercialPropertyDetails"
                    value={prop.commercialPropertyDetails}
                    onChange={handleChange}
                    className="form-input"
                    rows="2"
                  />
                </div>
              )}
              <div>
                <label className="form-label">Other Assets</label>
                <textarea
                  name="propertyDetails.otherAssets"
                  value={prop.otherAssets}
                  onChange={handleChange}
                  className="form-input"
                  rows="2"
                  placeholder="Any other assets or investments..."
                />
              </div>
              <div>
                <label className="form-label">Property Description</label>
                <textarea
                  name="propertyDetails.propertyDescription"
                  value={prop.propertyDescription}
                  onChange={handleChange}
                  className="form-input"
                  rows="3"
                  placeholder="Additional details about properties..."
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h2 className="text-xl font-bold text-text-dark mb-4">
              Upload Photos
            </h2>
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary-maroon transition-colors cursor-pointer"
              onClick={triggerFileUpload}
            >
              <FaCamera className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-text-dark font-medium mb-2">
                Upload Profile Photos
              </p>
              <p className="text-text-light text-sm mb-4">
                Upload at least 1 photo (Maximum 4 photos allowed)
              </p>
              <button
                type="button"
                className="btn-gold inline-block"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileUpload();
                }}
              >
                <FaCamera className="inline mr-2" />
                Choose Photos
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              {isUploading && (
                <div className="mt-4">
                  <FaSpinner className="animate-spin text-primary-maroon text-2xl mx-auto" />
                  <p className="text-text-light text-sm mt-2">Uploading...</p>
                </div>
              )}
            </div>

            {/* Photo Preview */}
            {selectedPhotos.length > 0 && (
              <div className="mt-4">
                <p className="text-text-dark font-medium mb-2">
                  {selectedPhotos.length} photo(s) selected
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-600">
                Upload at least 1 photo. You can add more photos later from your
                profile.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-dark">
              Complete Your Profile
            </h1>
            <p className="text-text-light mt-2">
              Tell us about yourself to find the perfect match
            </p>
          </div>

          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    i <= step
                      ? "bg-primary-maroon text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < step ? <FaCheckCircle /> : i}
                </div>
                <span
                  className={`text-xs mt-2 ${i === step ? "text-primary-maroon font-semibold" : "text-text-light"}`}
                >
                  Step {i}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-premium p-8">
            {renderStep()}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 text-text-dark hover:border-primary-maroon transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                onClick={step === totalSteps ? handleSubmit : nextStep}
                disabled={isSaving || isUploading}
                className="ml-auto btn-maroon flex items-center space-x-2"
              >
                {isSaving || isUploading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <span>
                      {step === totalSteps ? "Complete Profile" : "Next"}
                    </span>
                    {step !== totalSteps && <FaArrowRight />}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// // ==================== SUCCESS STORIES PAGE ====================
// const SuccessStoriesPage = () => {
//   const [stories, setStories] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const fileInputRef = useRef(null);

//   const [formData, setFormData] = useState({
//     coupleName: "",
//     brideName: "",
//     groomName: "",
//     story: "",
//     testimonial: "",
//     weddingDate: "",
//     location: "",
//     photos: [],
//   });

//   const loadStories = async () => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get(
//         `${API_URL}/admin/success-stories`,
//         getHeaders(),
//       );
//       setStories(response.data.stories || []);
//     } catch (error) {
//       console.error("Error loading stories:", error);
//       toast.error("Failed to load success stories");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadStories();
//   }, []);

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setSelectedImage(reader.result);
//         setFormData((prev) => ({
//           ...prev,
//           photos: [{ url: reader.result }],
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const triggerFileUpload = () => {
//     fileInputRef.current?.click();
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSaving(true);
//     try {
//       await axios.post(
//         `${API_URL}/admin/success-stories`,
//         formData,
//         getHeaders(),
//       );
//       toast.success("Success story added!");
//       setShowModal(false);
//       setFormData({
//         coupleName: "",
//         brideName: "",
//         groomName: "",
//         story: "",
//         testimonial: "",
//         weddingDate: "",
//         location: "",
//         photos: [],
//       });
//       setSelectedImage(null);
//       loadStories();
//     } catch (error) {
//       console.error("Error adding story:", error);
//       toast.error(error.response?.data?.message || "Failed to add story");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleApprove = async (id) => {
//     try {
//       await axios.put(
//         `${API_URL}/admin/success-stories/${id}/approve`,
//         {},
//         getHeaders(),
//       );
//       toast.success("Story approved!");
//       loadStories();
//     } catch (error) {
//       toast.error("Failed to approve story");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this story?")) return;
//     try {
//       await axios.delete(
//         `${API_URL}/admin/success-stories/${id}`,
//         getHeaders(),
//       );
//       toast.success("Story deleted");
//       loadStories();
//     } catch (error) {
//       toast.error("Failed to delete story");
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
//         <div className="container mx-auto max-w-6xl">
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <h1 className="text-3xl font-bold text-text-dark">
//                 Success Stories
//               </h1>
//               <p className="text-text-light">
//                 Manage success stories and testimonials
//               </p>
//             </div>
//             <button
//               onClick={() => setShowModal(true)}
//               className="btn-gold flex items-center space-x-2"
//             >
//               <FaPlus />
//               <span>Add Story</span>
//             </button>
//           </div>

//           {isLoading ? (
//             <div className="flex justify-center py-12">
//               <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
//             </div>
//           ) : stories.length === 0 ? (
//             <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
//               <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-text-dark">
//                 No Success Stories
//               </h3>
//               <p className="text-text-light">Add your first success story!</p>
//               <button
//                 onClick={() => setShowModal(true)}
//                 className="btn-maroon inline-block mt-4"
//               >
//                 <FaPlus className="inline mr-2" />
//                 Add Story
//               </button>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {stories.map((story) => (
//                 <div
//                   key={story._id}
//                   className="bg-white rounded-2xl shadow-premium overflow-hidden"
//                 >
//                   <div className="relative h-56">
//                     {story.photos && story.photos.length > 0 ? (
//                       <img
//                         src={story.photos[0].url}
//                         alt={story.coupleName}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center text-white text-4xl font-bold">
//                         {story.coupleName?.charAt(0) || "S"}
//                       </div>
//                     )}
//                     <div className="absolute top-2 right-2 flex space-x-1">
//                       {story.approved ? (
//                         <span className="bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center">
//                           <FaCheck className="mr-1" /> Approved
//                         </span>
//                       ) : (
//                         <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center">
//                           <FaClock className="mr-1" /> Pending
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                   <div className="p-4">
//                     <h3 className="text-lg font-semibold text-text-dark">
//                       {story.coupleName}
//                     </h3>
//                     <p className="text-text-light text-sm">
//                       {story.brideName} & {story.groomName}
//                     </p>
//                     <p className="text-text-light text-sm">
//                       {story.location || "Location not specified"}
//                     </p>
//                     <p className="text-text-light text-sm">
//                       <FaCalendar className="inline mr-1" />
//                       {story.weddingDate
//                         ? new Date(story.weddingDate).toLocaleDateString()
//                         : "Date not set"}
//                     </p>
//                     <p className="text-text-dark text-sm mt-2 line-clamp-2">
//                       {story.story}
//                     </p>
//                     <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
//                       <div className="flex space-x-2">
//                         {!story.approved && (
//                           <button
//                             onClick={() => handleApprove(story._id)}
//                             className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
//                             title="Approve"
//                           >
//                             <FaCheck />
//                           </button>
//                         )}
//                         <button
//                           onClick={() => handleDelete(story._id)}
//                           className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
//                           title="Delete"
//                         >
//                           <FaTrash />
//                         </button>
//                       </div>
//                       {story.approved && (
//                         <span className="text-xs text-text-light">
//                           Published
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Add Story Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-text-dark">
//                 Add Success Story
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   setFormData({
//                     coupleName: "",
//                     brideName: "",
//                     groomName: "",
//                     story: "",
//                     testimonial: "",
//                     weddingDate: "",
//                     location: "",
//                     photos: [],
//                   });
//                   setSelectedImage(null);
//                 }}
//                 className="text-text-light hover:text-text-dark"
//               >
//                 <FaTimes className="text-2xl" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="space-y-4">
//                 <div>
//                   <label className="form-label">Couple Photo</label>
//                   <div
//                     className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-maroon transition-colors cursor-pointer"
//                     onClick={triggerFileUpload}
//                   >
//                     {selectedImage ? (
//                       <div className="relative">
//                         <img
//                           src={selectedImage}
//                           alt="Couple"
//                           className="max-h-48 mx-auto rounded-lg"
//                         />
//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setSelectedImage(null);
//                             setFormData((prev) => ({ ...prev, photos: [] }));
//                           }}
//                           className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
//                         >
//                           <FaTimes className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : (
//                       <div>
//                         <FaCamera className="text-4xl text-gray-400 mx-auto mb-2" />
//                         <p className="text-text-dark font-medium">
//                           Click to upload photo
//                         </p>
//                         <p className="text-text-light text-sm">
//                           JPEG, PNG, GIF (max 5MB)
//                         </p>
//                       </div>
//                     )}
//                     <input
//                       type="file"
//                       ref={fileInputRef}
//                       onChange={handleImageUpload}
//                       accept="image/*"
//                       className="hidden"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="form-label">Couple Name *</label>
//                     <input
//                       type="text"
//                       name="coupleName"
//                       value={formData.coupleName}
//                       onChange={handleChange}
//                       className="form-input"
//                       required
//                       placeholder="e.g. Ravi & Sneha"
//                     />
//                   </div>
//                   <div>
//                     <label className="form-label">Wedding Date *</label>
//                     <input
//                       type="date"
//                       name="weddingDate"
//                       value={formData.weddingDate}
//                       onChange={handleChange}
//                       className="form-input"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="form-label">Bride Name *</label>
//                     <input
//                       type="text"
//                       name="brideName"
//                       value={formData.brideName}
//                       onChange={handleChange}
//                       className="form-input"
//                       required
//                       placeholder="Bride's full name"
//                     />
//                   </div>
//                   <div>
//                     <label className="form-label">Groom Name *</label>
//                     <input
//                       type="text"
//                       name="groomName"
//                       value={formData.groomName}
//                       onChange={handleChange}
//                       className="form-input"
//                       required
//                       placeholder="Groom's full name"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="form-label">Location</label>
//                   <input
//                     type="text"
//                     name="location"
//                     value={formData.location}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="e.g. Bidar, Karnataka"
//                   />
//                 </div>

//                 <div>
//                   <label className="form-label">Story *</label>
//                   <textarea
//                     name="story"
//                     value={formData.story}
//                     onChange={handleChange}
//                     className="form-input"
//                     rows="4"
//                     required
//                     placeholder="Share their love story..."
//                   />
//                 </div>

//                 <div>
//                   <label className="form-label">Testimonial</label>
//                   <textarea
//                     name="testimonial"
//                     value={formData.testimonial}
//                     onChange={handleChange}
//                     className="form-input"
//                     rows="2"
//                     placeholder="What they say about Shubha Mangalam..."
//                   />
//                 </div>
//               </div>

//               <div className="flex space-x-3 mt-6 pt-4 border-t">
//                 <button
//                   type="submit"
//                   disabled={isSaving}
//                   className="btn-maroon flex-1 flex items-center justify-center space-x-2"
//                 >
//                   {isSaving ? (
//                     <FaSpinner className="animate-spin" />
//                   ) : (
//                     <FaPlus />
//                   )}
//                   <span>{isSaving ? "Adding..." : "Add Story"}</span>
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     setFormData({
//                       coupleName: "",
//                       brideName: "",
//                       groomName: "",
//                       story: "",
//                       testimonial: "",
//                       weddingDate: "",
//                       location: "",
//                       photos: [],
//                     });
//                     setSelectedImage(null);
//                   }}
//                   className="px-6 py-3 rounded-xl border-2 border-gray-300 text-text-dark hover:border-primary-maroon transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </Layout>
//   );
// };

// ==================== ADMIN PAGES ====================

// Add Profile Page
const AddProfilePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [mainProfilePhoto, setMainProfilePhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const mainPhotoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    password: "",
    personalDetails: {
      age: "",
      dateOfBirth: "",
      gender: "",
      religion: "",
      caste: "",
      motherTongue: "",
      education: "",
      occupation: "",
      annualIncome: "",
      maritalStatus: "",
      height: "",
      weight: "",
      location: { state: "", city: "" },
      aboutMe: "",
    },
    familyDetails: {
      fatherName: "",
      motherName: "",
      brothers: 0,
      sisters: 0,
      familyBackground: "",
    },
    partnerPreferences: {
      ageRange: { min: "", max: "" },
      religion: "",
      caste: "",
      education: "",
      occupation: "",
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split(".");
    setFormData((prev) => {
      let newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = type === "checkbox" ? checked : value;
      return newData;
    });
  };

  const handleMainPhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainProfilePhoto(reader.result);
      toast.success("Main profile photo selected!");
    };
    reader.readAsDataURL(file);
  };

  const triggerMainPhotoUpload = () => {
    mainPhotoInputRef.current?.click();
  };

  const removeMainPhoto = () => {
    setMainProfilePhoto(null);
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalPhotos = selectedPhotos.length + files.length;
    if (totalPhotos > 4) {
      toast.error("You can upload a maximum of 4 gallery photos only!");
      return;
    }

    setIsUploading(true);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((results) => {
        setSelectedPhotos((prev) => [...prev, ...results]);
        setIsUploading(false);
        toast.success(`${results.length} photo(s) selected`);
      })
      .catch((err) => {
        console.error("Error reading files:", err);
        toast.error("Failed to read photos");
        setIsUploading(false);
      });
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = (index) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const profilePayload = { ...formData };

      const createResponse = await axios.post(
        `${API_URL}/admin/profiles/create`,
        profilePayload,
        getHeaders(),
      );

      const newUserId = createResponse.data.user.id;

      let mainPhotoUrl = null;
      if (mainProfilePhoto) {
        try {
          const response = await axios.post(
            `${API_URL}/profiles/profile-image`,
            { image: mainProfilePhoto, userId: newUserId },
            getHeaders(),
          );
          mainPhotoUrl = response.data.profileImage;
        } catch (photoError) {
          console.error("Main photo upload error:", photoError);
          toast.warning("Profile created but main photo upload failed");
        }
      }

      let uploadedPhotos = [];
      if (selectedPhotos.length > 0) {
        try {
          const response = await axios.post(
            `${API_URL}/profiles/photos`,
            { photos: selectedPhotos, userId: newUserId },
            getHeaders(),
          );
          if (response.data && response.data.photos) {
            uploadedPhotos = response.data.photos;
          }
        } catch (photoError) {
          console.error("Gallery photo upload error:", photoError);
          toast.warning("Profile created but gallery photos upload failed");
        }
      }

      if (mainPhotoUrl || uploadedPhotos.length > 0) {
        try {
          const updatePayload = {
            ...formData,
            profileImage: mainPhotoUrl,
            photos: uploadedPhotos,
          };
          await axios.post(
            `${API_URL}/profiles/save`,
            updatePayload,
            getHeaders(),
          );
        } catch (updateError) {
          console.error("Profile update error:", updateError);
          toast.warning("Profile created but photo update failed");
        }
      }

      toast.success("Profile created successfully!");
      setFormData({
        fullName: "",
        mobileNumber: "",
        password: "",
        personalDetails: {
          age: "",
          dateOfBirth: "",
          gender: "",
          religion: "",
          caste: "",
          motherTongue: "",
          education: "",
          occupation: "",
          annualIncome: "",
          maritalStatus: "",
          height: "",
          weight: "",
          location: { state: "", city: "" },
          aboutMe: "",
        },
        familyDetails: {
          fatherName: "",
          motherName: "",
          brothers: 0,
          sisters: 0,
          familyBackground: "",
        },
        partnerPreferences: {
          ageRange: { min: "", max: "" },
          religion: "",
          caste: "",
          education: "",
          occupation: "",
        },
      });
      setSelectedPhotos([]);
      setMainProfilePhoto(null);
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error(error.response?.data?.message || "Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-text-dark mb-8">
            Add New Profile
          </h1>
          <p className="text-text-light mb-6">
            Create a profile for offline client with main photo and gallery
          </p>

          <div className="bg-white rounded-2xl shadow-premium p-8">
            <form onSubmit={handleSubmit}>
              {/* Main Profile Photo Upload */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  Main Profile Photo
                </h3>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {mainProfilePhoto ? (
                        <img
                          src={mainProfilePhoto}
                          alt="Main Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <FaCamera className="text-3xl text-gray-400 mx-auto" />
                          <p className="text-xs text-gray-400 mt-1">No Photo</p>
                        </div>
                      )}
                    </div>
                    {mainProfilePhoto && (
                      <button
                        type="button"
                        onClick={removeMainPhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={triggerMainPhotoUpload}
                      className="btn-gold text-sm px-6 py-2"
                    >
                      <FaCamera className="inline mr-2" />
                      {mainProfilePhoto ? "Change Photo" : "Upload Photo"}
                    </button>
                    <p className="text-text-light text-xs mt-2">
                      This will be the main profile picture
                    </p>
                    <input
                      type="file"
                      ref={mainPhotoInputRef}
                      onChange={handleMainPhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Gallery Photos Upload Section */}
              <div className="mb-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  Gallery Photos (Max 4)
                </h3>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-maroon transition-colors cursor-pointer"
                  onClick={triggerFileUpload}
                >
                  <FaCamera className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-text-dark font-medium">
                    Click to upload gallery photos
                  </p>
                  <p className="text-text-light text-sm">
                    Upload up to 4 additional photos
                  </p>
                  <button
                    type="button"
                    className="btn-gold inline-block mt-3 text-sm px-6 py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileUpload();
                    }}
                  >
                    <FaCamera className="inline mr-2" />
                    Choose Photos
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  {isUploading && (
                    <div className="mt-3">
                      <FaSpinner className="animate-spin text-primary-maroon text-2xl mx-auto" />
                      <p className="text-text-light text-sm mt-1">
                        Uploading...
                      </p>
                    </div>
                  )}
                </div>

                {selectedPhotos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-text-dark font-medium mb-2">
                      {selectedPhotos.length} photo(s) selected
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold text-text-dark mb-4 border-t pt-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Mobile Number *</label>
                  <input
                    name="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Leave blank for default"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-text-dark mt-6 mb-4">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Age *</label>
                  <input
                    name="personalDetails.age"
                    type="number"
                    value={formData.personalDetails.age}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Date of Birth *</label>
                  <input
                    name="personalDetails.dateOfBirth"
                    type="date"
                    value={formData.personalDetails.dateOfBirth}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Gender *</label>
                  <select
                    name="personalDetails.gender"
                    value={formData.personalDetails.gender}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Religion *</label>
                  <input
                    name="personalDetails.religion"
                    value={formData.personalDetails.religion}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Caste *</label>
                  <input
                    name="personalDetails.caste"
                    value={formData.personalDetails.caste}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Mother Tongue *</label>
                  <input
                    name="personalDetails.motherTongue"
                    value={formData.personalDetails.motherTongue}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Education *</label>
                  <input
                    name="personalDetails.education"
                    value={formData.personalDetails.education}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Occupation *</label>
                  <input
                    name="personalDetails.occupation"
                    value={formData.personalDetails.occupation}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Annual Income *</label>
                  <input
                    name="personalDetails.annualIncome"
                    type="number"
                    value={formData.personalDetails.annualIncome}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Marital Status *</label>
                  <select
                    name="personalDetails.maritalStatus"
                    value={formData.personalDetails.maritalStatus}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select</option>
                    <option value="unmarried">Unmarried</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Height (cm) *</label>
                  <input
                    name="personalDetails.height"
                    type="number"
                    value={formData.personalDetails.height}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Weight (kg) *</label>
                  <input
                    name="personalDetails.weight"
                    type="number"
                    value={formData.personalDetails.weight}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">State *</label>
                  <input
                    name="personalDetails.location.state"
                    value={formData.personalDetails.location.state}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">City *</label>
                  <input
                    name="personalDetails.location.city"
                    value={formData.personalDetails.location.city}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">About Me</label>
                  <textarea
                    name="personalDetails.aboutMe"
                    value={formData.personalDetails.aboutMe}
                    onChange={handleChange}
                    className="form-input"
                    rows="2"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-text-dark mt-6 mb-4">
                Family Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Father's Name *</label>
                  <input
                    name="familyDetails.fatherName"
                    value={formData.familyDetails.fatherName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Mother's Name *</label>
                  <input
                    name="familyDetails.motherName"
                    value={formData.familyDetails.motherName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Brothers</label>
                  <input
                    name="familyDetails.brothers"
                    type="number"
                    value={formData.familyDetails.brothers}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Sisters</label>
                  <input
                    name="familyDetails.sisters"
                    type="number"
                    value={formData.familyDetails.sisters}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Family Background *</label>
                  <select
                    name="familyDetails.familyBackground"
                    value={formData.familyDetails.familyBackground}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select</option>
                    <option value="nuclear">Nuclear</option>
                    <option value="joint">Joint</option>
                    <option value="extended">Extended</option>
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-text-dark mt-6 mb-4">
                Partner Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Min Age *</label>
                  <input
                    name="partnerPreferences.ageRange.min"
                    type="number"
                    value={formData.partnerPreferences.ageRange.min}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Max Age *</label>
                  <input
                    name="partnerPreferences.ageRange.max"
                    type="number"
                    value={formData.partnerPreferences.ageRange.max}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Preferred Religion *</label>
                  <input
                    name="partnerPreferences.religion"
                    value={formData.partnerPreferences.religion}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Preferred Caste *</label>
                  <input
                    name="partnerPreferences.caste"
                    value={formData.partnerPreferences.caste}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Preferred Education *</label>
                  <input
                    name="partnerPreferences.education"
                    value={formData.partnerPreferences.education}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Preferred Occupation *</label>
                  <input
                    name="partnerPreferences.occupation"
                    value={formData.partnerPreferences.occupation}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t">
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="btn-maroon flex items-center space-x-2"
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaUserPlus />
                  )}
                  <span>{isLoading ? "Creating..." : "Create Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Dashboard Page
const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/admin/dashboard/stats`,
        getHeaders(),
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-text-dark mb-8">
            Admin Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-premium p-6">
              <p className="text-text-light text-sm">Total Users</p>
              <p className="text-3xl font-bold text-text-dark">
                {stats?.users?.total || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-premium p-6">
              <p className="text-text-light text-sm">Active Users</p>
              <p className="text-3xl font-bold text-text-dark">
                {stats?.users?.active || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-premium p-6">
              <p className="text-text-light text-sm">Total Profiles</p>
              <p className="text-3xl font-bold text-text-dark">
                {stats?.profiles?.total || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-premium p-6">
              <p className="text-text-light text-sm">Interests</p>
              <p className="text-3xl font-bold text-text-dark">
                {stats?.interests?.total || 0}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-premium p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/admin/users"
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-center"
              >
                <FaUsers className="text-2xl text-primary-maroon mx-auto mb-2" />
                <span className="text-sm text-text-dark">Users</span>
              </Link>
              <Link
                to="/admin/interests"
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-center"
              >
                <FaHeart className="text-2xl text-primary-maroon mx-auto mb-2" />
                <span className="text-sm text-text-dark">Interests</span>
              </Link>
              <Link
                to="/admin/callbacks"
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-center"
              >
                <FaPhone className="text-2xl text-primary-maroon mx-auto mb-2" />
                <span className="text-sm text-text-dark">Callbacks</span>
              </Link>
              <Link
                to="/admin/complaints"
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-center"
              >
                <FaExclamationTriangle className="text-2xl text-primary-maroon mx-auto mb-2" />
                <span className="text-sm text-text-dark">Complaints</span>
              </Link>
              <Link
                to="/admin/success-stories"
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-center"
              >
                <FaStar className="text-2xl text-primary-maroon mx-auto mb-2" />
                <span className="text-sm text-text-dark">Success Stories</span>
              </Link>
              <Link
                to="/admin/add-profile"
                className="p-4 bg-primary-maroon text-white rounded-xl hover:bg-[#600018] text-center col-span-2"
              >
                <FaUserPlus className="text-2xl mx-auto mb-2" />
                <span className="text-sm">Add New Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Users Management Page
const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/users`, getHeaders());
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm("Suspend this user?")) return;
    try {
      await axios.put(`${API_URL}/admin/users/${id}/suspend`, {}, getHeaders());
      toast.success("User suspended");
      loadUsers();
    } catch (error) {
      toast.error("Failed to suspend user");
    }
  };

  const handleUnsuspend = async (id) => {
    try {
      await axios.put(
        `${API_URL}/admin/users/${id}/unsuspend`,
        {},
        getHeaders(),
      );
      toast.success("User unsuspended");
      loadUsers();
    } catch (error) {
      toast.error("Failed to unsuspend user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user account permanently?")) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`, getHeaders());
      toast.success("User deleted");
      loadUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobileNumber?.includes(searchTerm);
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive && !user.isSuspended) ||
      (filterStatus === "suspended" && user.isSuspended) ||
      (filterStatus === "inactive" && !user.isActive && !user.isSuspended);
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark">
                Users Management
              </h1>
              <p className="text-text-light">
                Manage all users and their profiles
              </p>
            </div>
            <button
              onClick={loadUsers}
              className="btn-gold flex items-center space-x-2"
            >
              <FaSync className="text-sm" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-premium p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-maroon outline-none transition-colors"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-maroon outline-none transition-colors"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
              <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark">
                No Users Found
              </h3>
              <p className="text-text-light">
                No users match your search criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Profile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-primary-maroon flex items-center justify-center text-white font-bold">
                              {user.fullName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-text-dark">
                                {user.fullName}
                              </p>
                              <p className="text-xs text-text-light">
                                ID: {user._id?.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-dark">
                          {user.mobileNumber}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.hasProfile
                                ? user.isProfilePublic
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {user.hasProfile
                              ? user.isProfilePublic
                                ? "Public"
                                : "Private"
                              : "No Profile"}
                          </span>
                          {user.hasProfile && (
                            <span className="ml-2 text-xs text-text-light">
                              {user.profileCompletion || 0}%
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.isSuspended ? (
                            <span className="flex items-center text-red-500">
                              <FaTimes className="mr-1" /> Suspended
                            </span>
                          ) : user.isActive ? (
                            <span className="flex items-center text-green-500">
                              <FaCheck className="mr-1" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-500">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/profile/${user._id}`}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <FaEye />
                            </Link>
                            <a
                              href={`tel:${user.mobileNumber}`}
                              className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                              title="Call"
                            >
                              <FaPhone />
                            </a>
                            <a
                              href={`https://wa.me/${user.mobileNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="WhatsApp"
                            >
                              <FaWhatsapp />
                            </a>
                            {user.isSuspended ? (
                              <button
                                onClick={() => handleUnsuspend(user._id)}
                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                title="Unsuspend"
                              >
                                <FaCheckCircle />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspend(user._id)}
                                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Suspend"
                              >
                                <FaBan />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 text-sm text-text-light">
                Total: {filteredUsers.length} users
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// Callbacks Page
const CallbacksPage = () => (
  <Layout>
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-text-dark mb-8">
          Callback Requests
        </h1>
        <div className="bg-white rounded-2xl shadow-premium p-8 text-center">
          <FaPhone className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-text-light">No callback requests yet.</p>
        </div>
      </div>
    </div>
  </Layout>
);

// Complaints Page
const ComplaintsPage = () => (
  <Layout>
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-text-dark mb-8">Complaints</h1>
        <div className="bg-white rounded-2xl shadow-premium p-8 text-center">
          <FaExclamationTriangle className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-text-light">No complaints reported.</p>
        </div>
      </div>
    </div>
  </Layout>
);

// Admin Interests Page
const AdminInterestsPage = () => {
  const [interests, setInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/admin/interests`,
        getHeaders(),
      );
      setInterests(response.data.interests || []);
    } catch (error) {
      console.error("Error loading interests:", error);
      toast.error("Failed to load interests");
    } finally {
      setIsLoading(false);
    }
  };

  const updateInterestStatus = async (interestId, status) => {
    try {
      await axios.put(
        `${API_URL}/admin/interests/${interestId}`,
        { status },
        getHeaders(),
      );
      toast.success(`Interest ${status}`);
      loadInterests();
    } catch (error) {
      toast.error("Failed to update interest");
    }
  };

  const filteredInterests =
    filter === "all" ? interests : interests.filter((i) => i.status === filter);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark">
                Interest Management
              </h1>
              <p className="text-text-light">
                Monitor and manage all user interests
              </p>
            </div>
            <button
              onClick={loadInterests}
              className="btn-gold flex items-center space-x-2"
            >
              <FaSync className="text-sm" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-premium p-6">
              <p className="text-text-light text-sm">Total Interests</p>
              <p className="text-3xl font-bold text-text-dark">
                {interests.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-premium p-6">
              <p className="text-text-light text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {interests.filter((i) => i.status === "pending").length}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-premium p-6">
              <p className="text-text-light text-sm">Accepted</p>
              <p className="text-3xl font-bold text-green-600">
                {interests.filter((i) => i.status === "accepted").length}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-premium p-6">
              <p className="text-text-light text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600">
                {interests.filter((i) => i.status === "rejected").length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-premium p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "all"
                    ? "bg-primary-maroon text-white"
                    : "bg-gray-100 text-text-dark hover:bg-gray-200"
                }`}
              >
                All ({interests.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-text-dark hover:bg-gray-200"
                }`}
              >
                Pending (
                {interests.filter((i) => i.status === "pending").length})
              </button>
              <button
                onClick={() => setFilter("accepted")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "accepted"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-text-dark hover:bg-gray-200"
                }`}
              >
                Accepted (
                {interests.filter((i) => i.status === "accepted").length})
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-text-dark hover:bg-gray-200"
                }`}
              >
                Rejected (
                {interests.filter((i) => i.status === "rejected").length})
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
            </div>
          ) : filteredInterests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
              <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark">
                No Interests Found
              </h3>
              <p className="text-text-light">
                No interests match your current filter.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Sender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Receiver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInterests.map((interest) => (
                      <tr
                        key={interest._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary-maroon flex items-center justify-center text-white font-bold text-sm">
                              {interest.senderId?.fullName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-text-dark">
                                {interest.senderId?.fullName || "Unknown"}
                              </p>
                              <p className="text-xs text-text-light">
                                {interest.senderId?.mobileNumber || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary-gold flex items-center justify-center text-white font-bold text-sm">
                              {interest.receiverId?.fullName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-text-dark">
                                {interest.receiverId?.fullName || "Unknown"}
                              </p>
                              <p className="text-xs text-text-light">
                                {interest.receiverId?.mobileNumber || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-dark text-sm">
                          {new Date(interest.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              interest.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : interest.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {interest.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {interest.status === "pending" && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  updateInterestStatus(interest._id, "accepted")
                                }
                                className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  updateInterestStatus(interest._id, "rejected")
                                }
                                className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {interest.status === "accepted" && (
                            <span className="text-green-500 text-sm">
                              ✓ Matched
                            </span>
                          )}
                          {interest.status === "rejected" && (
                            <span className="text-red-500 text-sm">
                              ✗ Declined
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// ==================== APP ====================
function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/broker-office" element={<BrokerOfficePage />} />
        <Route path="/success-stories" element={<SuccessStoriesPage />} />

        {/* Protected Routes */}
        <Route path="/complete-profile" element={<ProfileCompletionPage />} />
        <Route path="/my-profile" element={<MyProfilePage />} />
        <Route path="/profile/:id" element={<ViewProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/interests" element={<InterestsPage />} />
        <Route path="/saved" element={<SavedProfilesPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/users" element={<UsersManagementPage />} />
        <Route path="/admin/callbacks" element={<CallbacksPage />} />
        <Route path="/admin/complaints" element={<ComplaintsPage />} />
        <Route path="/admin/interests" element={<AdminInterestsPage />} />
        <Route
          path="/admin/success-stories"
          element={<AdminSuccessStoriesPage />}
        />
        <Route path="/admin/success-stories" element={<SuccessStoriesPage />} />
        {/* <Route path="/admin/testimonials" element={<AdminTestimonials />} /> */}
        <Route path="/admin/add-profile" element={<AddProfilePage />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </Router>
  );
}
export default App;
