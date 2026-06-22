import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaHeart,
  FaShieldAlt,
  FaUsers,
  FaStar,
  FaArrowRight,
  FaPhone,
  FaWhatsapp,
  FaBuilding,
  FaQuoteRight,
  FaPlay,
  FaPause,
  FaChevronRight,
  FaChevronLeft,
  FaUserCheck,
  FaHandshake,
  FaRegSmile,
  FaSpinner,
  FaUser,
  FaMapMarkerAlt,
  FaCalendar,
  FaGraduationCap,
  FaBriefcase,
  FaVenusMars,
} from "react-icons/fa";
import { HiSparkles, HiOutlineSparkles } from "react-icons/hi";
import { MdVerified, MdOutlineSecurity } from "react-icons/md";
import Layout from "../../components/common/Layout";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const HomePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("token") !== null;
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentStory, setCurrentStory] = useState(0);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const autoPlayRef = useRef(null);
  const [isProfileTransitioning, setIsProfileTransitioning] = useState(false);

  // Scroll animations
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  // ============ REAL DATA STATES ============
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfiles: 0,
    totalInterests: 0,
    successStories: 0,
  });
  const [testimonials, setTestimonials] = useState([]);
  const [successStories, setSuccessStories] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [membersCount, setMembersCount] = useState(0);
  const [interestsCount, setInterestsCount] = useState(0);
  const [profilesCount, setProfilesCount] = useState(0);
  const [storiesCount, setStoriesCount] = useState(0);

  // ============ FETCH PUBLIC DATA ============
  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await axios.get(`${API_URL}/public/stats`);
      const statsData = statsRes.data;

      setMembersCount(statsData.totalUsers || 0);
      setInterestsCount(statsData.totalInterests || 0);
      setProfilesCount(statsData.totalProfiles || 0);
      setStoriesCount(statsData.successStories || 0);

      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalProfiles: statsData.totalProfiles || 0,
        totalInterests: statsData.totalInterests || 0,
        successStories: statsData.successStories || 0,
      });

      try {
        const storiesRes = await axios.get(`${API_URL}/public/success-stories`);
        const stories = storiesRes.data?.stories || [];

        const formattedStories = stories.slice(0, 5).map((s) => ({
          id: s._id,
          couple: s.coupleName || `${s.brideName} & ${s.groomName}`,
          story:
            s.story || "A beautiful love story found through Shubha Mangalam.",
          date: s.weddingDate
            ? new Date(s.weddingDate).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "Recently",
          image:
            s.photos?.[0]?.url ||
            "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800",
          location: s.location || "India",
          testimonial: s.testimonial || "",
          brideName: s.brideName || "",
          groomName: s.groomName || "",
        }));

        setSuccessStories(formattedStories);

        const testimonialData = stories
          .filter((s) => s.testimonial)
          .slice(0, 5)
          .map((s) => ({
            id: s._id,
            name: s.coupleName || `${s.brideName} & ${s.groomName}`,
            story:
              s.testimonial ||
              s.story?.slice(0, 150) ||
              "Shubha Mangalam helped us find our perfect match.",
            location: s.location || "India",
            rating: 5,
            image:
              s.photos?.[0]?.url ||
              "https://images.unsplash.com/photo-1581400371480-0e4a6b9e7a7a?w=800",
          }));

        setTestimonials(testimonialData);
      } catch (storyError) {
        console.error("Error fetching stories:", storyError);
        setSuccessStories([]);
        setTestimonials([]);
      }

      try {
        const profilesRes = await axios.get(`${API_URL}/public/profiles`, {
          params: { limit: 20 },
        });
        const profileData = profilesRes.data?.profiles || [];
        setProfiles(profileData);
      } catch (profileError) {
        console.error("Error fetching profiles:", profileError);
        setProfiles([]);
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
      setMembersCount(0);
      setInterestsCount(0);
      setProfilesCount(0);
      setStoriesCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-play for testimonials
  useEffect(() => {
    if (isAutoPlaying && testimonials.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        if (successStories.length > 1) {
          setCurrentStory((prev) => (prev + 1) % successStories.length);
        }
      }, 4000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, testimonials.length, successStories.length]);

  // Auto-scroll profiles
  useEffect(() => {
    if (profiles.length > 1) {
      const interval = setInterval(() => {
        if (!isProfileTransitioning) {
          setIsProfileTransitioning(true);
          setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
          setTimeout(() => {
            setIsProfileTransitioning(false);
          }, 800);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [profiles.length, isProfileTransitioning]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nextTestimonial = () => {
    if (testimonials.length > 1) {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 5000);
    }
  };

  const prevTestimonial = () => {
    if (testimonials.length > 1) {
      setCurrentTestimonial(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length,
      );
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 5000);
    }
  };

  const nextStory = () => {
    if (successStories.length > 1) {
      setCurrentStory((prev) => (prev + 1) % successStories.length);
    }
  };

  const prevStory = () => {
    if (successStories.length > 1) {
      setCurrentStory(
        (prev) => (prev - 1 + successStories.length) % successStories.length,
      );
    }
  };

  const handleProfileClick = (profileId) => {
    if (isAuthenticated) {
      navigate(`/profile/${profileId}`);
    } else {
      toast.info("Please login to view profiles");
      navigate("/login");
    }
  };

  // Get cards for cinematic stack
  const getCinematicCards = () => {
    if (profiles.length === 0) return [];
    const total = profiles.length;
    const frontIndex = currentProfileIndex % total;
    const cards = [];

    for (let i = 4; i >= 1; i--) {
      const index = (frontIndex - i + total) % total;
      cards.push({
        ...profiles[index],
        position: i,
      });
    }
    cards.push({
      ...profiles[frontIndex],
      position: 0,
    });

    return cards;
  };

  // ============ FEATURES DATA ============
  const features = [
    {
      icon: FaHandshake,
      title: "Trusted Matchmaking",
      description:
        "Expert brokers with years of experience in connecting families with trust and tradition.",
      gradient: "from-amber-400 via-orange-500 to-red-500",
      iconGradient: "from-amber-400 to-orange-500",
      glow: "shadow-amber-500/30",
    },
    {
      icon: MdOutlineSecurity,
      title: "Privacy Protected",
      description:
        "Your contact details are safe. All communication is broker-mediated for your security.",
      gradient: "from-blue-400 via-cyan-500 to-teal-500",
      iconGradient: "from-blue-400 to-cyan-500",
      glow: "shadow-blue-500/30",
    },
    {
      icon: MdVerified,
      title: "Verified Profiles",
      description:
        "Every profile is verified and authenticated before being made public on our platform.",
      gradient: "from-emerald-400 via-green-500 to-teal-500",
      iconGradient: "from-emerald-400 to-green-500",
      glow: "shadow-green-500/30",
    },
    {
      icon: FaUserCheck,
      title: "Broker Mediated",
      description:
        "Expert brokers facilitate connections, manage the matchmaking process, and ensure successful matches.",
      gradient: "from-purple-400 via-pink-500 to-rose-500",
      iconGradient: "from-purple-400 to-pink-500",
      glow: "shadow-purple-500/30",
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-primary-gold to-amber-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const cinematicCards = getCinematicCards();

  return (
    <Layout>
      {/* ============ HERO SECTION - MOBILE FIXED ============ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden w-full"
      >
        {/* Animated Background - MOBILE RESPONSIVE */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0000] via-[#1a0505] to-[#2d0a0a] overflow-hidden">
          {/* Smaller orbs on mobile */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-r from-primary-maroon/20 via-primary-gold/10 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -50, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-l from-primary-gold/20 via-amber-500/10 to-transparent rounded-full blur-3xl"
          />
        </div>

        {/* Particle System - Reduced on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: `radial-gradient(circle, ${
                  i % 3 === 0 ? "#D4AF37" : i % 3 === 1 ? "#800020" : "#FFD700"
                }, transparent)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
              }}
              animate={{
                y: [0, -Math.random() * 100 - 30, 0],
                x: [0, (Math.random() - 0.5) * 50, 0],
                opacity: [0, Math.random() * 0.5 + 0.2, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 6 + 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.4,
                type: "spring",
                stiffness: 200,
              }}
              className="inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2.5 rounded-full bg-gradient-to-r from-primary-gold/20 via-primary-maroon/20 to-primary-gold/20 backdrop-blur-xl border border-primary-gold/30 mb-6 md:mb-8 shadow-lg shadow-primary-gold/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <HiSparkles className="text-primary-gold text-xs md:text-sm" />
              </motion.div>
              <span className="text-xs md:text-sm font-medium text-primary-gold tracking-wider">
                #1 Premium Matrimony
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-3xl md:text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-4 md:mb-6"
            >
              <span className="relative">
                <motion.span
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="bg-gradient-to-r from-primary-gold via-amber-300 via-white to-primary-gold bg-clip-text text-transparent bg-[length:300%_300%]"
                >
                  Find Your Soulmate
                </motion.span>
              </span>
              <span className="block text-2xl md:text-4xl lg:text-5xl xl:text-6xl mt-1 md:mt-2 text-white/80 font-light tracking-wide">
                With Shubha Mangalam
              </span>
            </motion.h1>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="w-20 md:w-32 h-0.5 bg-gradient-to-r from-transparent via-primary-gold to-transparent mx-auto my-4 md:my-6"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-base md:text-xl lg:text-2xl text-white/50 max-w-3xl mx-auto mb-6 md:mb-10 leading-relaxed px-2"
            >
              India's premier matrimonial platform connecting families with
              trust, tradition, and technology.
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="block text-primary-gold mt-1 md:mt-2 font-light text-sm md:text-base"
              >
                Where love stories begin.
              </motion.span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-8 md:mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={isAuthenticated ? "/search" : "/register"}
                  className="group relative px-6 md:px-10 py-3 md:py-4 bg-gradient-to-r from-primary-gold via-amber-500 to-primary-gold text-white rounded-2xl font-semibold text-sm md:text-lg overflow-hidden shadow-xl shadow-primary-gold/20 w-full sm:w-auto block text-center"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-gold via-yellow-400 to-primary-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <FaArrowRight />
                    </motion.span>
                  </span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/broker-office"
                  className="px-6 md:px-10 py-3 md:py-4 bg-white/5 backdrop-blur-xl text-white rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-white/5 w-full sm:w-auto"
                >
                  <FaBuilding />
                  <span>Broker Office</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Search Bar - Mobile Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative group">
                <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 md:p-2 border border-white/10 shadow-2xl shadow-black/20">
                  <div className="flex items-center gap-1 md:gap-2">
                    <FaSearch className="text-primary-gold/60 ml-2 md:ml-3 text-sm md:text-base" />
                    <input
                      type="text"
                      placeholder="Search by name, location..."
                      className="flex-1 bg-transparent text-white placeholder-white/30 py-2 md:py-3 px-1 md:px-2 outline-none text-sm md:text-base min-w-0"
                    />
                    <Link
                      to="/search"
                      className="px-4 md:px-6 py-1.5 md:py-2 bg-gradient-to-r from-primary-gold to-amber-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-gold/20 transition-all duration-300 flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap"
                    >
                      <FaSearch className="text-xs md:text-sm" />
                      <span className="hidden xs:inline">Search</span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats - Mobile Responsive */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 md:mt-12"
            >
              {[
                {
                  icon: FaUsers,
                  label: "Members",
                  value: membersCount.toLocaleString(),
                  gradient: "from-blue-400 to-cyan-400",
                },
                {
                  icon: FaHeart,
                  label: "Interests",
                  value: interestsCount.toLocaleString(),
                  gradient: "from-rose-400 to-pink-400",
                },
                {
                  icon: MdVerified,
                  label: "Verified",
                  value: profilesCount.toLocaleString(),
                  gradient: "from-emerald-400 to-green-400",
                },
                {
                  icon: FaRegSmile,
                  label: "Stories",
                  value: storiesCount.toLocaleString(),
                  gradient: "from-amber-400 to-orange-400",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 md:gap-3 text-white/70 hover:text-white/90 transition-all group cursor-default"
                >
                  <div
                    className={`bg-gradient-to-r ${stat.gradient} p-1.5 md:p-2 rounded-lg`}
                  >
                    <stat.icon className="text-white text-sm md:text-lg" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg md:text-2xl lg:text-3xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-[10px] md:text-xs text-white/40">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 text-white/30"
        >
          <div className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-white/20 flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-gradient-to-b from-primary-gold to-amber-500 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* ============ CINEMATIC 3D CARD STACK SECTION - MOBILE FIXED ============ */}
      <section className="py-16 md:py-32 bg-gradient-to-b from-black via-[#0a0505] to-black relative overflow-hidden w-full">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-maroon/10 via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <span className="inline-block text-primary-gold font-semibold tracking-wider text-xs md:text-sm mb-3 md:mb-4">
              MEET OUR MEMBERS
            </span>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-3 md:mb-6"
            >
              Recent <span className="text-primary-gold">Profiles</span>
            </motion.h2>
            <p className="text-white/50 text-sm md:text-lg max-w-2xl mx-auto px-2">
              {profiles.length > 0
                ? `${profiles.length} verified profiles looking for their perfect match`
                : "Be the first to join and find your perfect match"}
            </p>
          </motion.div>

          {/* Cinematic 3D Card Stack */}
          <div className="relative max-w-4xl mx-auto">
            {profiles.length > 0 ? (
              <>
                <div className="relative flex justify-center items-center min-h-[400px] md:min-h-[550px] perspective-1200">
                  {cinematicCards.map((profile, index) => {
                    const isFront = index === cinematicCards.length - 1;
                    const position = profile.position || 4;

                    const offsetX = position * 15;
                    const offsetY = position * 10;
                    const scale = 1 - position * 0.06;
                    const opacity = 1 - position * 0.2;
                    const rotateY = position * 5;
                    const rotateX = position * 2;
                    const zIndex = 100 - position * 10;
                    const blur = position * 2;

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

                    return (
                      <motion.div
                        key={profile._id + position}
                        initial={{
                          x: offsetX,
                          y: offsetY,
                          scale: scale,
                          opacity: opacity,
                          rotateY: rotateY,
                          rotateX: rotateX,
                          zIndex: zIndex,
                          filter: `blur(${blur}px)`,
                        }}
                        animate={{
                          x: isFront ? 0 : offsetX,
                          y: isFront ? 0 : offsetY,
                          scale: isFront ? 1 : scale,
                          opacity: isFront ? 1 : opacity,
                          rotateY: isFront ? 0 : rotateY,
                          rotateX: isFront ? 0 : rotateX,
                          zIndex: isFront ? 1000 : zIndex,
                          filter: isFront ? "blur(0px)" : `blur(${blur}px)`,
                        }}
                        transition={{
                          duration: 0.8,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        whileHover={
                          isFront
                            ? {
                                scale: 1.02,
                                y: -5,
                                transition: { duration: 0.3 },
                              }
                            : {}
                        }
                        className="absolute cursor-pointer"
                        onClick={() => handleProfileClick(profile._id)}
                        style={{
                          width: "100%",
                          maxWidth: "340px",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <div
                          className={`bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-2xl md:rounded-3xl border ${
                            isFront
                              ? "border-primary-gold/50 shadow-2xl shadow-primary-gold/30"
                              : "border-white/10 shadow-xl"
                          } overflow-hidden transition-all duration-300 relative`}
                        >
                          {isFront && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-br from-primary-gold/5 to-transparent pointer-events-none"></div>
                              <div className="absolute -inset-1 bg-gradient-to-r from-primary-gold/20 to-primary-maroon/20 opacity-50 blur-xl pointer-events-none"></div>
                            </>
                          )}

                          <div className="relative">
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt={name}
                                className={`w-full ${isFront ? "h-56 md:h-80" : "h-44 md:h-64"} object-cover transition-all duration-700`}
                              />
                            ) : (
                              <div
                                className={`w-full ${isFront ? "h-56 md:h-80" : "h-44 md:h-64"} bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center text-white ${isFront ? "text-6xl md:text-8xl" : "text-4xl md:text-6xl"} font-bold`}
                              >
                                {name.charAt(0).toUpperCase()}
                              </div>
                            )}

                            {isFront && (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-2 md:top-4 right-2 md:right-4 bg-gradient-to-r from-primary-gold to-amber-500 text-black text-[10px] md:text-xs font-bold px-2 md:px-4 py-1 md:py-1.5 rounded-full shadow-lg flex items-center gap-1"
                              >
                                <HiSparkles className="text-xs md:text-sm" />
                                Featured
                              </motion.div>
                            )}

                            <div
                              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 md:p-${isFront ? "6" : "4"}`}
                            >
                              <h3
                                className={`text-white ${isFront ? "text-lg md:text-2xl" : "text-base md:text-xl"} font-bold`}
                              >
                                {name}
                                {isFront && (
                                  <span className="ml-2 text-primary-gold text-xs md:text-sm font-normal">
                                    ✦
                                  </span>
                                )}
                              </h3>
                              <div
                                className={`flex flex-wrap gap-1 md:gap-${isFront ? "3" : "2"} mt-0.5 md:mt-1 text-white/80 text-[10px] md:text-sm`}
                              >
                                <span className="flex items-center gap-0.5 md:gap-1">
                                  <FaCalendar className="text-primary-gold text-[8px] md:text-xs" />
                                  {age} yrs
                                </span>
                                <span className="flex items-center gap-0.5 md:gap-1">
                                  <FaVenusMars className="text-primary-gold text-[8px] md:text-xs" />
                                  {gender || "N/A"}
                                </span>
                                <span className="flex items-center gap-0.5 md:gap-1">
                                  <FaMapMarkerAlt className="text-primary-gold text-[8px] md:text-xs" />
                                  {city || state || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`p-3 md:p-${isFront ? "6" : "4"} space-y-1 md:space-y-2`}
                          >
                            {isFront ? (
                              <>
                                <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                                  <div className="flex items-center gap-1 md:gap-2 text-white/60 bg-white/5 rounded-xl px-2 md:px-3 py-1.5 md:py-2">
                                    <FaGraduationCap className="text-primary-gold/60 text-xs md:text-sm" />
                                    <span className="truncate text-[10px] md:text-sm">
                                      {education || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 md:gap-2 text-white/60 bg-white/5 rounded-xl px-2 md:px-3 py-1.5 md:py-2">
                                    <FaBriefcase className="text-primary-gold/60 text-xs md:text-sm" />
                                    <span className="truncate text-[10px] md:text-sm">
                                      {occupation || "N/A"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1 md:gap-2 mt-1 md:mt-2">
                                  <span className="px-2 md:px-3 py-0.5 md:py-1 bg-white/5 rounded-full text-[10px] md:text-xs text-white/40 border border-white/5">
                                    {pd.religion || "Any Religion"}
                                  </span>
                                  <span className="px-2 md:px-3 py-0.5 md:py-1 bg-white/5 rounded-full text-[10px] md:text-xs text-white/40 border border-white/5">
                                    {pd.motherTongue || "Any Language"}
                                  </span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full mt-2 md:mt-3 py-2 md:py-3 bg-gradient-to-r from-primary-gold to-amber-500 text-black font-semibold rounded-xl text-xs md:text-sm hover:shadow-lg hover:shadow-primary-gold/30 transition-all duration-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProfileClick(profile._id);
                                  }}
                                >
                                  View Full Profile
                                </motion.button>
                              </>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 md:gap-2 text-white/40 text-[10px] md:text-xs">
                                  <FaGraduationCap className="text-primary-gold/40 text-[8px] md:text-xs" />
                                  <span className="truncate">
                                    {education || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 md:gap-2 text-white/40 text-[10px] md:text-xs">
                                  <FaBriefcase className="text-primary-gold/40 text-[8px] md:text-xs" />
                                  <span className="truncate">
                                    {occupation || "N/A"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {isFront && (
                            <div className="absolute -bottom-1 -left-1 -right-1 h-1 bg-gradient-to-r from-transparent via-primary-gold/50 to-transparent"></div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Navigation Controls */}
                {profiles.length > 1 && (
                  <div className="flex justify-center items-center gap-4 md:gap-8 mt-6 md:mt-10">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (!isProfileTransitioning) {
                          setIsProfileTransitioning(true);
                          setCurrentProfileIndex(
                            (prev) =>
                              (prev - 1 + profiles.length) % profiles.length,
                          );
                          setTimeout(
                            () => setIsProfileTransitioning(false),
                            800,
                          );
                        }
                      }}
                      className="p-2 md:p-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                    >
                      <svg
                        className="w-4 h-4 md:w-6 md:h-6 text-white group-hover:text-primary-gold transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </motion.button>

                    <div className="flex items-center gap-2 md:gap-3">
                      {profiles
                        .slice(0, Math.min(profiles.length, 6))
                        .map((_, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => {
                              if (!isProfileTransitioning) {
                                setIsProfileTransitioning(true);
                                setCurrentProfileIndex(index);
                                setTimeout(
                                  () => setIsProfileTransitioning(false),
                                  800,
                                );
                              }
                            }}
                            className={`h-1 rounded-full transition-all duration-500 ${
                              index === currentProfileIndex % profiles.length
                                ? "bg-gradient-to-r from-primary-gold to-amber-500 w-6 md:w-10 shadow-lg shadow-primary-gold/50"
                                : "bg-white/20 w-3 md:w-4 hover:bg-white/40"
                            }`}
                          />
                        ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (!isProfileTransitioning) {
                          setIsProfileTransitioning(true);
                          setCurrentProfileIndex(
                            (prev) => (prev + 1) % profiles.length,
                          );
                          setTimeout(
                            () => setIsProfileTransitioning(false),
                            800,
                          );
                        }
                      }}
                      className="p-2 md:p-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                    >
                      <svg
                        className="w-4 h-4 md:w-6 md:h-6 text-white group-hover:text-primary-gold transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </motion.button>
                  </div>
                )}

                {/* View All Profiles Button */}
                <div className="text-center mt-6 md:mt-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/search"
                      className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-2 md:py-3 border border-primary-gold/30 text-primary-gold rounded-xl hover:bg-primary-gold/10 transition-all duration-300 group text-sm md:text-base"
                    >
                      <span>View All {profiles.length} Profiles</span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <FaArrowRight className="text-xs md:text-sm" />
                      </motion.span>
                    </Link>
                  </motion.div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 md:py-20">
                <div className="text-4xl md:text-6xl mb-4">💑</div>
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                  No Profiles Yet
                </h3>
                <p className="text-white/40 mb-4 md:mb-6 text-sm md:text-base px-4">
                  Be the first to join and find your perfect match!
                </p>
                <Link
                  to="/register"
                  className="inline-block px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-primary-gold to-amber-500 text-black rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-gold/20 transition-all text-sm md:text-base"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION - MOBILE FIXED ============ */}
      <section className="py-16 md:py-32 bg-gradient-to-b from-black via-[#0a0505] to-black relative overflow-hidden w-full">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-maroon/5 via-transparent to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-20"
          >
            <span className="inline-block text-primary-gold font-semibold tracking-wider text-xs md:text-sm mb-3 md:mb-4">
              FEATURES
            </span>
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-3 md:mb-6">
              Designed for <span className="text-primary-gold">Love</span>
            </h2>
            <p className="text-white/50 text-sm md:text-lg max-w-2xl mx-auto px-2">
              Every feature crafted to help you find your perfect match
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group relative bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 border border-white/5 hover:border-primary-gold/20 transition-all duration-500 overflow-hidden"
                >
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}
                  ></div>
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-r ${feature.iconGradient} flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg ${feature.glow}`}
                    >
                      <Icon className="text-white text-xl md:text-2xl" />
                    </motion.div>
                    <h3 className="text-base md:text-xl font-semibold text-white mb-1 md:mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/50 text-xs md:text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ SUCCESS STORIES - MOBILE FIXED ============ */}
      <section className="py-16 md:py-32 bg-gradient-to-b from-black via-[#0a0505] to-black relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary-maroon/5 via-transparent to-transparent overflow-hidden pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-20"
          >
            <span className="inline-block text-primary-gold font-semibold tracking-wider text-xs md:text-sm mb-3 md:mb-4">
              STORIES
            </span>
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-3 md:mb-6">
              Real <span className="text-primary-gold">Love Stories</span>
            </h2>
            <p className="text-white/50 text-sm md:text-lg max-w-2xl mx-auto px-2">
              {storiesCount} happy couples found their match through us
            </p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {successStories.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={successStories[currentStory]?.id || currentStory}
                    initial={{ opacity: 0, x: 30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -30, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="relative bg-gradient-to-r from-primary-maroon/10 to-primary-gold/5 rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-primary-maroon/5"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <div className="relative h-48 md:h-64 lg:h-auto overflow-hidden">
                        <motion.img
                          src={
                            successStories[currentStory]?.image ||
                            "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800"
                          }
                          alt={
                            successStories[currentStory]?.couple ||
                            "Success Story"
                          }
                          className="w-full h-full object-cover"
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.8 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden"></div>
                      </div>
                      <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-center">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-4">
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                              >
                                <FaStar className="text-primary-gold text-xs md:text-base" />
                              </motion.div>
                            ))}
                          </div>
                          <h3 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">
                            {successStories[currentStory]?.couple ||
                              "Happy Couple"}
                          </h3>
                          <p className="text-primary-gold text-xs md:text-sm mb-2 md:mb-4">
                            {successStories[currentStory]?.location || "India"}{" "}
                            • {successStories[currentStory]?.date || "Recently"}
                          </p>
                          <p className="text-white/70 text-sm md:text-base leading-relaxed mb-4 md:mb-6">
                            "
                            {successStories[currentStory]?.story ||
                              "A beautiful love story found through Shubha Mangalam."}
                            "
                          </p>
                          <Link
                            to="/success-stories"
                            className="text-primary-gold hover:text-amber-400 transition-colors flex items-center gap-2 group text-sm md:text-base"
                          >
                            Read Full Story
                            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {successStories.length > 1 && (
                  <div className="flex justify-center gap-3 md:gap-4 mt-6 md:mt-8">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={prevStory}
                      className="p-2 md:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <FaChevronLeft className="text-white text-xs md:text-base" />
                    </motion.button>
                    <div className="flex gap-1 md:gap-2 items-center">
                      {successStories.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentStory(index)}
                          className={`w-2 h-2 rounded-full transition-all ${currentStory === index ? "bg-gradient-to-r from-primary-gold to-amber-500 w-4 md:w-6" : "bg-white/20 hover:bg-white/40"}`}
                        />
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={nextStory}
                      className="p-2 md:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <FaChevronRight className="text-white text-xs md:text-base" />
                    </motion.button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 md:py-20 text-white/40">
                <p>No success stories yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS - MOBILE FIXED ============ */}
      <section className="py-16 md:py-32 bg-gradient-to-b from-black via-[#0a0505] to-black relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-maroon/5 via-transparent to-transparent overflow-hidden pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-20"
          >
            <span className="inline-block text-primary-gold font-semibold tracking-wider text-xs md:text-sm mb-3 md:mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-3 md:mb-6">
              What Our <span className="text-primary-gold">Members Say</span>
            </h2>
            <p className="text-white/50 text-sm md:text-lg max-w-2xl mx-auto px-2">
              Real stories from real couples who found love through us
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto relative">
            {testimonials.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={
                      testimonials[currentTestimonial]?.id || currentTestimonial
                    }
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 border border-white/10 shadow-2xl"
                  >
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-primary-gold/30 mb-4 md:mb-6"
                      >
                        <img
                          src={
                            testimonials[currentTestimonial]?.image ||
                            "https://images.unsplash.com/photo-1581400371480-0e4a6b9e7a7a?w=800"
                          }
                          alt={
                            testimonials[currentTestimonial]?.name || "Member"
                          }
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 3, 0, -3, 0],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <FaQuoteRight className="text-primary-gold/30 text-3xl md:text-4xl mb-3 md:mb-4" />
                        </motion.div>
                        <p className="text-base md:text-xl lg:text-2xl text-white/80 leading-relaxed mb-4 md:mb-6 px-2">
                          "
                          {testimonials[currentTestimonial]?.story ||
                            "Shubha Mangalam helped us find our perfect match."}
                          "
                        </p>
                        <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className="text-primary-gold text-xs md:text-sm"
                            />
                          ))}
                        </div>
                        <p className="text-white font-semibold text-sm md:text-base">
                          {testimonials[currentTestimonial]?.name ||
                            "Happy Couple"}
                        </p>
                        <p className="text-white/40 text-xs md:text-sm">
                          {testimonials[currentTestimonial]?.location ||
                            "India"}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {testimonials.length > 1 && (
                  <>
                    <div className="flex justify-center gap-3 md:gap-4 mt-6 md:mt-8">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={prevTestimonial}
                        className="p-2 md:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <FaChevronLeft className="text-white text-xs md:text-base" />
                      </motion.button>
                      <div className="flex gap-1 md:gap-2 items-center">
                        {testimonials.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentTestimonial(index)}
                            className={`w-2 h-2 rounded-full transition-all ${currentTestimonial === index ? "bg-gradient-to-r from-primary-gold to-amber-500 w-4 md:w-6" : "bg-white/20 hover:bg-white/40"}`}
                          />
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={nextTestimonial}
                        className="p-2 md:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <FaChevronRight className="text-white text-xs md:text-base" />
                      </motion.button>
                    </div>

                    <div className="flex justify-center mt-3 md:mt-4">
                      <button
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className="text-white/40 hover:text-white/60 transition-colors text-xs md:text-sm flex items-center gap-2"
                      >
                        {isAutoPlaying ? <FaPause /> : <FaPlay />}
                        <span>
                          {isAutoPlaying ? "Auto-play on" : "Auto-play off"}
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12 md:py-20 text-white/40">
                <p>No testimonials yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION - MOBILE FIXED ============ */}
      <section className="py-16 md:py-32 bg-gradient-to-b from-black via-[#0a0505] to-black relative overflow-hidden w-full">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-maroon/10 via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-primary-gold/20 bg-primary-gold/10 backdrop-blur-sm mb-4 md:mb-6"
            >
              <HiOutlineSparkles className="text-primary-gold text-xs md:text-sm animate-pulse" />
              <span className="text-xs md:text-sm font-medium text-primary-gold">
                Start Your Journey Today
              </span>
            </motion.div>

            <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-3 md:mb-6">
              Ready to Find{" "}
              <span className="text-primary-gold">Your Perfect Match</span>?
            </h2>
            <p className="text-base md:text-xl text-white/60 mb-8 md:mb-12 max-w-2xl mx-auto px-2">
              Join {membersCount.toLocaleString()} members and find your
              soulmate through Shubha Mangalam
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={isAuthenticated ? "/search" : "/register"}
                  className="group px-6 md:px-10 py-3 md:py-4 bg-gradient-to-r from-primary-gold via-amber-500 to-primary-gold text-white rounded-2xl font-semibold text-sm md:text-lg overflow-hidden transition-all duration-300 shadow-2xl shadow-primary-gold/30 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-gold via-yellow-400 to-primary-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    {isAuthenticated
                      ? "Start Searching"
                      : "Create Free Account"}
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <FaArrowRight />
                    </motion.span>
                  </span>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="tel:+919110480411"
                  className="px-6 md:px-10 py-3 md:py-4 bg-white/5 backdrop-blur-sm text-white rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto"
                >
                  <FaPhone />
                  <span>Call Broker</span>
                </a>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="https://wa.me/918123427060"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 md:px-10 py-3 md:py-4 bg-green-500/10 backdrop-blur-sm text-white rounded-2xl border border-green-500/20 hover:bg-green-500/20 transition-all flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto"
                >
                  <FaWhatsapp />
                  <span>WhatsApp</span>
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 8s ease infinite;
          background-size: 300% 300%;
        }
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(20px); opacity: 0; }
        }
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
        .perspective-1200 {
          perspective: 1200px;
        }
        
        /* Hide scroll indicator on very small screens */
        @media (max-width: 480px) {
          .perspective-1200 {
            perspective: 800px;
          }
        }
        
        /* Extra small screen fixes */
        @media (max-width: 400px) {
          .container {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
        }
      `}</style>
    </Layout>
  );
};

export default HomePage;
