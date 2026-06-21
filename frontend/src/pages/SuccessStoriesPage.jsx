import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaStar,
  FaHeart,
  FaCalendar,
  FaMapMarkerAlt,
  FaSpinner,
  FaClock,
  FaQuoteRight,
  FaUserFriends,
  FaArrowLeft,
} from "react-icons/fa";
import Layout from "../components/common/Layout";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PlaceholderImage = ({ text, className }) => (
  <div
    className={`${className} bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center text-white text-4xl font-bold`}
  >
    {text?.charAt(0)?.toUpperCase() || "?"}
  </div>
);

const SuccessStoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setIsLoading(true);
    try {
      // Try public endpoint first (no auth required)
      const response = await axios.get(`${API_URL}/public/success-stories`);
      const storiesData = response.data?.stories || [];

      // Filter approved stories
      const approvedStories = storiesData.filter((s) => s.approved !== false);
      setStories(approvedStories);

      if (approvedStories.length > 0) {
        setSelectedStory(approvedStories[0]);
      }
    } catch (error) {
      console.error("Error loading stories:", error);
      // Try admin endpoint as fallback
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(`${API_URL}/admin/success-stories`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const storiesData = response.data?.stories || [];
          const approvedStories = storiesData.filter(
            (s) => s.approved !== false,
          );
          setStories(approvedStories);
          if (approvedStories.length > 0) {
            setSelectedStory(approvedStories[0]);
          }
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        toast.error("Failed to load success stories");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#0a0505]">
          <FaSpinner className="text-4xl text-primary-gold animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-black to-[#0a0505] py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Success <span className="text-primary-gold">Stories</span>
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Real love stories from couples who found their perfect match
              through Shubha Mangalam
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary-gold hover:text-amber-400 transition-colors mt-4"
            >
              <FaArrowLeft />
              <span>Back to Home</span>
            </Link>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <FaHeart className="text-6xl mx-auto mb-4 text-primary-gold/30" />
              <p className="text-xl">No success stories yet.</p>
              <p className="text-sm mt-2">Be the first to share your story!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stories List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FaUserFriends className="text-primary-gold" />
                  <span>All Stories ({stories.length})</span>
                </h2>
                <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-primary-gold/20">
                  {stories.map((story) => (
                    <button
                      key={story._id}
                      onClick={() => setSelectedStory(story)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                        selectedStory?._id === story._id
                          ? "bg-primary-maroon/20 border border-primary-gold/30"
                          : "bg-white/5 border border-white/5 hover:bg-white/10"
                      }`}
                    >
                      <h3 className="text-white font-medium">
                        {story.coupleName ||
                          `${story.brideName} & ${story.groomName}`}
                      </h3>
                      <p className="text-white/40 text-sm">
                        {story.location || "India"}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className="text-primary-gold text-xs"
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Story Detail */}
              <div className="lg:col-span-2">
                {selectedStory && (
                  <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                    <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
                      {selectedStory.photos?.[0]?.url ? (
                        <img
                          src={selectedStory.photos[0].url}
                          alt={selectedStory.coupleName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PlaceholderImage
                          text={selectedStory.coupleName}
                          className="w-full h-full"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                          {selectedStory.coupleName ||
                            `${selectedStory.brideName} & ${selectedStory.groomName}`}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-white/70 text-sm">
                          <span className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-primary-gold" />
                            {selectedStory.location || "India"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaCalendar className="text-primary-gold" />
                            {selectedStory.weddingDate
                              ? new Date(
                                  selectedStory.weddingDate,
                                ).toLocaleDateString("en-US", {
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Date not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className="text-primary-gold" />
                        ))}
                      </div>
                      <p className="text-white/80 leading-relaxed text-lg">
                        "
                        {selectedStory.story ||
                          "A beautiful love story found through Shubha Mangalam."}
                        "
                      </p>
                      {selectedStory.testimonial && (
                        <div className="mt-4 p-4 bg-primary-gold/10 rounded-xl border border-primary-gold/20">
                          <FaQuoteRight className="text-primary-gold/40 text-2xl mb-2" />
                          <p className="text-white/70 italic">
                            "{selectedStory.testimonial}"
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-white/50 text-sm">
                          <FaClock />
                          <span>
                            Posted{" "}
                            {new Date(
                              selectedStory.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SuccessStoriesPage;
