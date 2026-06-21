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
  FaCrown,
  FaGem,
  FaFire,
  FaCompass,
  FaInfinity,
} from "react-icons/fa";
import { HiSparkles, HiOutlineSparkles, HiLightBulb } from "react-icons/hi";
import {
  MdVerified,
  MdOutlineSecurity,
  MdOutlineStars,
  MdOutlineAutoAwesome,
} from "react-icons/md";
import { FiAward, FiGlobe } from "react-icons/fi";
import { BsFillSuitHeartFill, BsStars } from "react-icons/bs";
import Layout from "../../components/common/Layout";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:5000/api";

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

  // ============ CINEMATIC FEATURES DATA ============
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
            <div className="w-20 h-20 border-4 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-gold to-amber-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const cinematicCards = getCinematicCards();

  return (
    <Layout>
      {/* ============ CINEMATIC HERO SECTION ============ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background with Rich Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0000] via-[#1a0505] to-[#2d0a0a]">
          {/* Animated Gradient Orbs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-primary-maroon/20 via-primary-gold/10 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-l from-primary-gold/20 via-amber-500/10 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary-maroon/5 via-primary-gold/5 to-transparent rounded-full blur-3xl"
          />
        </div>

        {/* Cinematic Particle System */}
        <div className="absolute inset-0">
          {[...Array(80)].map((_, i) => (
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
                y: [0, -Math.random() * 200 - 50, 0],
                x: [0, (Math.random() - 0.5) * 100, 0],
                opacity: [0, Math.random() * 0.5 + 0.2, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 8 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Cinematic Light Rays */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%]"
          >
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-[1px] h-[120%] bg-gradient-to-b from-transparent via-primary-gold/5 to-transparent"
                style={{
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Cinematic Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.4,
                type: "spring",
                stiffness: 200,
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-primary-gold/20 via-primary-maroon/20 to-primary-gold/20 backdrop-blur-xl border border-primary-gold/30 mb-8 shadow-lg shadow-primary-gold/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <HiSparkles className="text-primary-gold text-sm" />
              </motion.div>
              <span className="text-sm font-medium text-primary-gold tracking-wider">
                #1 Premium Matrimony Platform
              </span>
            </motion.div>

            {/* Main Heading with Cinematic Gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
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
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-4 -z-10 bg-gradient-to-r from-primary-gold/10 via-amber-500/5 to-primary-gold/10 blur-3xl"
                />
              </span>
              <span className="block text-4xl md:text-5xl lg:text-6xl mt-2 text-white/80 font-light tracking-wide">
                With Shubha Mangalam
              </span>
            </motion.h1>

            {/* Cinematic Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="w-32 h-0.5 bg-gradient-to-r from-transparent via-primary-gold to-transparent mx-auto my-6"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              India's premier matrimonial platform connecting families with
              trust, tradition, and technology.
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="block text-primary-gold mt-2 font-light"
              >
                Where love stories begin.
              </motion.span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={isAuthenticated ? "/search" : "/register"}
                  className="group relative px-10 py-4 bg-gradient-to-r from-primary-gold via-amber-500 to-primary-gold text-white rounded-2xl font-semibold text-lg overflow-hidden shadow-xl shadow-primary-gold/20"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-gold via-yellow-400 to-primary-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative z-10 flex items-center gap-2">
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
                  className="px-10 py-4 bg-white/5 backdrop-blur-xl text-white rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                >
                  <FaBuilding />
                  <span>Broker Office</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Cinematic Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative group">
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-1 bg-gradient-to-r from-primary-gold/20 via-amber-500/20 to-primary-gold/20 rounded-2xl blur-xl"
                />
                <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/10 shadow-2xl shadow-black/20">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <FaSearch className="text-primary-gold/60 ml-3" />
                    </motion.div>
                    <input
                      type="text"
                      placeholder="Search by name, location, religion..."
                      className="flex-1 bg-transparent text-white placeholder-white/30 py-3 px-2 outline-none"
                    />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/search"
                        className="px-6 py-2 bg-gradient-to-r from-primary-gold to-amber-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-gold/20 transition-all duration-300 flex items-center gap-2"
                      >
                        <FaSearch className="text-sm" />
                        <span>Search</span>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Cinematic Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="flex flex-wrap justify-center gap-8 mt-12"
            >
              {[
                {
                  icon: FaUsers,
                  label: "Total Members",
                  value: membersCount.toLocaleString(),
                  gradient: "from-blue-400 to-cyan-400",
                },
                {
                  icon: FaHeart,
                  label: "Interests Sent",
                  value: interestsCount.toLocaleString(),
                  gradient: "from-rose-400 to-pink-400",
                },
                {
                  icon: MdVerified,
                  label: "Verified Profiles",
                  value: profilesCount.toLocaleString(),
                  gradient: "from-emerald-400 to-green-400",
                },
                {
                  icon: FaRegSmile,
                  label: "Success Stories",
                  value: storiesCount.toLocaleString(),
                  gradient: "from-amber-400 to-orange-400",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex items-center gap-3 text-white/70 hover:text-white/90 transition-all group cursor-default"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                    className={`bg-gradient-to-r ${stat.gradient} p-2 rounded-lg`}
                  >
                    <stat.icon className="text-white text-lg" />
                  </motion.div>
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.8 + index * 0.1 }}
                      className="font-semibold text-2xl md:text-3xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-xs text-white/40">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Cinematic Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/30"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-gradient-to-b from-primary-gold to-amber-500 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* ============ CINEMATIC 3D CARD STACK SECTION ============ */}
      <section className="py-32 bg-gradient-to-b from-black via-[#0a0505] to-black relative overflow-hidden">
        {/* Cinematic Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-maroon/10 via-transparent to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)]"></div>
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary-gold/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -80, 0],
                opacity: [0, 0.5, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 6 + 4,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-primary-gold font-semibold tracking-wider text-sm mb-4">
              MEET OUR MEMBERS
            </span>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Recent <span className="text-primary-gold">Profiles</span>
            </motion.h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {profiles.length > 0
                ? `${profiles.length} verified profiles looking for their perfect match`
                : "Be the first to join and find your perfect match"}
            </p>
          </motion.div>

          {/* Cinematic 3D Card Stack */}
          <div className="relative max-w-4xl mx-auto">
            {profiles.length > 0 ? (
              <>
                <div className="relative flex justify-center items-center min-h-[550px] perspective-1200">
                  {cinematicCards.map((profile, index) => {
                    const isFront = index === cinematicCards.length - 1;
                    const position = profile.position || 4;

                    const offsetX = position * 20;
                    const offsetY = position * 15;
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
                                scale: 1.03,
                                y: -8,
                                transition: { duration: 0.3 },
                              }
                            : {}
                        }
                        className="absolute cursor-pointer"
                        onClick={() => handleProfileClick(profile._id)}
                        style={{
                          width: "100%",
                          maxWidth: "400px",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <div
                          className={`bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border ${
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
                                className={`w-full ${isFront ? "h-80" : "h-64"} object-cover transition-all duration-700`}
                              />
                            ) : (
                              <div
                                className={`w-full ${isFront ? "h-80" : "h-64"} bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center text-white ${isFront ? "text-8xl" : "text-6xl"} font-bold`}
                              >
                                {name.charAt(0).toUpperCase()}
                              </div>
                            )}

                            {isFront && (
                              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                            )}

                            {isFront && (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-4 right-4 bg-gradient-to-r from-primary-gold to-amber-500 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1"
                              >
                                <HiSparkles className="text-sm" />
                                Featured
                              </motion.div>
                            )}

                            <div
                              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-${isFront ? "6" : "4"}`}
                            >
                              <h3
                                className={`text-white ${isFront ? "text-2xl" : "text-xl"} font-bold`}
                              >
                                {name}
                                {isFront && (
                                  <span className="ml-2 text-primary-gold text-sm font-normal">
                                    ✦
                                  </span>
                                )}
                              </h3>
                              <div
                                className={`flex flex-wrap gap-${isFront ? "3" : "2"} mt-1 text-white/80 text-sm`}
                              >
                                <span className="flex items-center gap-1">
                                  <FaCalendar className="text-primary-gold" />
                                  {age} yrs
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaVenusMars className="text-primary-gold" />
                                  {gender || "N/A"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaMapMarkerAlt className="text-primary-gold" />
                                  {city || state || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className={`p-${isFront ? "6" : "4"} space-y-2`}>
                            {isFront ? (
                              <>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="flex items-center gap-2 text-white/60 bg-white/5 rounded-xl px-3 py-2">
                                    <FaGraduationCap className="text-primary-gold/60" />
                                    <span className="truncate">
                                      {education || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-white/60 bg-white/5 rounded-xl px-3 py-2">
                                    <FaBriefcase className="text-primary-gold/60" />
                                    <span className="truncate">
                                      {occupation || "N/A"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/40 border border-white/5">
                                    {pd.religion || "Any Religion"}
                                  </span>
                                  <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/40 border border-white/5">
                                    {pd.motherTongue || "Any Language"}
                                  </span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full mt-3 py-3 bg-gradient-to-r from-primary-gold to-amber-500 text-black font-semibold rounded-xl text-sm hover:shadow-lg hover:shadow-primary-gold/30 transition-all duration-300"
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
                                <div className="flex items-center gap-2 text-white/40 text-xs">
                                  <FaGraduationCap className="text-primary-gold/40" />
                                  <span>{education || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/40 text-xs">
                                  <FaBriefcase className="text-primary-gold/40" />
                                  <span>{occupation || "N/A"}</span>
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

                {/* Cinematic Navigation Controls */}
                {profiles.length > 1 && (
                  <div className="flex justify-center items-center gap-8 mt-10">
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
                      className="p-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                    >
                      <svg
                        className="w-6 h-6 text-white group-hover:text-primary-gold transition-colors"
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

                    <div className="flex items-center gap-3">
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
                                ? "bg-gradient-to-r from-primary-gold to-amber-500 w-10 shadow-lg shadow-primary-gold/50"
                                : "bg-white/20 w-4 hover:bg-white/40"
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
                      className="p-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                    >
                      <svg
                        className="w-6 h-6 text-white group-hover:text-primary-gold transition-colors"
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
                <div className="text-center mt-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/search"
                      className="inline-flex items-center gap-3 px-8 py-3 border border-primary-gold/30 text-primary-gold rounded-xl hover:bg-primary-gold/10 transition-all duration-300 group"
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
                        <FaArrowRight className="text-sm" />
                      </motion.span>
                    </Link>
                  </motion.div>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">💑</div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  No Profiles Yet
                </h3>
                <p className="text-white/40 mb-6">
                  Be the first to join and find your perfect match!
                </p>
                <Link
                  to="/register"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-primary-gold to-amber-500 text-black rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-gold/20 transition-all"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ CINEMATIC FEATURES SECTION ============ */}
      <section className="py-32 bg-gradient-to-b from-black via-[#0a0505] to-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-maroon/5 via-transparent to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block text-primary-gold font-semibold tracking-wider text-sm mb-4">
              FEATURES
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Designed for <span className="text-primary-gold">Love</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Every feature crafted to help you find your perfect match
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="group relative bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-sm rounded-3xl p-8 border border-white/5 hover:border-primary-gold/20 transition-all duration-500 overflow-hidden"
                >
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}
                  ></div>
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.iconGradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg ${feature.glow}`}
                    >
                      <Icon className="text-white text-2xl" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/50 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CINEMATIC SUCCESS STORIES ============ */}
      <section className="py-32 bg-gradient-to-b from-black via-[#0a0505] to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary-maroon/5 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block text-primary-gold font-semibold tracking-wider text-sm mb-4">
              STORIES
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Real <span className="text-primary-gold">Love Stories</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {storiesCount} happy couples found their match through us
            </p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {successStories.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={successStories[currentStory]?.id || currentStory}
                    initial={{ opacity: 0, x: 60, scale: 0.9, rotateY: 10 }}
                    animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, x: -60, scale: 0.9, rotateY: -10 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="relative bg-gradient-to-r from-primary-maroon/10 to-primary-gold/5 rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-primary-maroon/5"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <div className="relative h-64 lg:h-auto overflow-hidden">
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
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                              >
                                <FaStar className="text-primary-gold" />
                              </motion.div>
                            ))}
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-2">
                            {successStories[currentStory]?.couple ||
                              "Happy Couple"}
                          </h3>
                          <p className="text-primary-gold text-sm mb-4">
                            {successStories[currentStory]?.location || "India"}{" "}
                            • {successStories[currentStory]?.date || "Recently"}
                          </p>
                          <p className="text-white/70 leading-relaxed mb-6">
                            "
                            {successStories[currentStory]?.story ||
                              "A beautiful love story found through Shubha Mangalam."}
                            "
                          </p>
                          <Link
                            to="/success-stories"
                            className="text-primary-gold hover:text-amber-400 transition-colors flex items-center gap-2 group"
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
                  <div className="flex justify-center gap-4 mt-8">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={prevStory}
                      className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <FaChevronLeft className="text-white" />
                    </motion.button>
                    <div className="flex gap-2 items-center">
                      {successStories.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentStory(index)}
                          className={`w-2 h-2 rounded-full transition-all ${currentStory === index ? "bg-gradient-to-r from-primary-gold to-amber-500 w-6" : "bg-white/20 hover:bg-white/40"}`}
                        />
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={nextStory}
                      className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <FaChevronRight className="text-white" />
                    </motion.button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-white/40">
                <p>No success stories yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ CINEMATIC TESTIMONIALS ============ */}
      <section className="py-32 bg-gradient-to-b from-black via-[#0a0505] to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-maroon/5 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block text-primary-gold font-semibold tracking-wider text-sm mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              What Our <span className="text-primary-gold">Members Say</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
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
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.9 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl"
                  >
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary-gold/30 mb-6"
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
                            rotate: [0, 5, 0, -5, 0],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <FaQuoteRight className="text-primary-gold/30 text-4xl mb-4" />
                        </motion.div>
                        <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-6">
                          "
                          {testimonials[currentTestimonial]?.story ||
                            "Shubha Mangalam helped us find our perfect match."}
                          "
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className="text-primary-gold text-sm"
                            />
                          ))}
                        </div>
                        <p className="text-white font-semibold">
                          {testimonials[currentTestimonial]?.name ||
                            "Happy Couple"}
                        </p>
                        <p className="text-white/40 text-sm">
                          {testimonials[currentTestimonial]?.location ||
                            "India"}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {testimonials.length > 1 && (
                  <>
                    <div className="flex justify-center gap-4 mt-8">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={prevTestimonial}
                        className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <FaChevronLeft className="text-white" />
                      </motion.button>
                      <div className="flex gap-2 items-center">
                        {testimonials.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentTestimonial(index)}
                            className={`w-2 h-2 rounded-full transition-all ${currentTestimonial === index ? "bg-gradient-to-r from-primary-gold to-amber-500 w-6" : "bg-white/20 hover:bg-white/40"}`}
                          />
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={nextTestimonial}
                        className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <FaChevronRight className="text-white" />
                      </motion.button>
                    </div>

                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className="text-white/40 hover:text-white/60 transition-colors text-sm flex items-center gap-2"
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
              <div className="text-center py-20 text-white/40">
                <p>No testimonials yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ CINEMATIC CTA SECTION ============ */}
      <section className="py-32 bg-gradient-to-b from-black via-[#0a0505] to-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-maroon/10 via-transparent to-transparent"></div>
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-primary-gold/5 to-transparent skew-x-12"
          />
          <motion.div
            animate={{ x: ["100%", "-100%"] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
              delay: 3,
            }}
            className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-transparent via-primary-gold/5 to-transparent skew-x-12"
          />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-gold/20 bg-primary-gold/10 backdrop-blur-sm mb-6"
            >
              <HiOutlineSparkles className="text-primary-gold text-sm animate-pulse" />
              <span className="text-sm font-medium text-primary-gold">
                Start Your Journey Today
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Find{" "}
              <span className="text-primary-gold">Your Perfect Match</span>?
            </h2>
            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              Join {membersCount.toLocaleString()} members and find your
              soulmate through Shubha Mangalam
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={isAuthenticated ? "/search" : "/register"}
                  className="group px-10 py-4 bg-gradient-to-r from-primary-gold via-amber-500 to-primary-gold text-white rounded-2xl font-semibold text-lg overflow-hidden transition-all duration-300 shadow-2xl shadow-primary-gold/30 flex items-center gap-2"
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
                  className="px-10 py-4 bg-white/5 backdrop-blur-sm text-white rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
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
                  className="px-10 py-4 bg-green-500/10 backdrop-blur-sm text-white rounded-2xl border border-green-500/20 hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
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
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(2deg); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
      `}</style>
    </Layout>
  );
};

export default HomePage;
