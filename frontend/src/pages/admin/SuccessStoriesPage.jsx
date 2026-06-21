import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaStar,
  FaHeart,
  FaCalendar,
  FaMapMarkerAlt,
  FaSpinner,
  FaClock,
  FaQuoteRight,
  FaUserFriends,
  FaTrash,
  FaCheck,
  FaTimes,
  FaCamera,
  FaEdit,
  FaEye,
  FaArrowLeft,
  FaSave,
} from "react-icons/fa";
import Layout from "../../components/common/Layout";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const PlaceholderImage = ({ text, className }) => (
  <div
    className={`${className} bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center text-white text-4xl font-bold`}
  >
    {text?.charAt(0)?.toUpperCase() || "?"}
  </div>
);

const AdminSuccessStoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [editingStory, setEditingStory] = useState(null);

  const [formData, setFormData] = useState({
    coupleName: "",
    brideName: "",
    groomName: "",
    story: "",
    testimonial: "",
    weddingDate: "",
    location: "",
    photos: [],
  });

  const loadStories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/admin/success-stories`,
        getHeaders(),
      );
      setStories(response.data.stories || []);
    } catch (error) {
      console.error("Error loading stories:", error);
      toast.error("Failed to load success stories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setFormData((prev) => ({
          ...prev,
          photos: [{ url: reader.result }],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      coupleName: "",
      brideName: "",
      groomName: "",
      story: "",
      testimonial: "",
      weddingDate: "",
      location: "",
      photos: [],
    });
    setSelectedImage(null);
    setEditingStory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.coupleName || !formData.story || !formData.weddingDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const submitData = {
        ...formData,
        weddingDate: new Date(formData.weddingDate),
        approved: true, // Auto-approve for admin
      };

      await axios.post(
        `${API_URL}/admin/success-stories`,
        submitData,
        getHeaders(),
      );

      toast.success("Success story added successfully!");
      setShowModal(false);
      resetForm();
      loadStories();
    } catch (error) {
      console.error("Error adding story:", error);
      toast.error(error.response?.data?.message || "Failed to add story");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `${API_URL}/admin/success-stories/${id}/approve`,
        {},
        getHeaders(),
      );
      toast.success("Story approved!");
      loadStories();
    } catch (error) {
      toast.error("Failed to approve story");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    try {
      await axios.delete(
        `${API_URL}/admin/success-stories/${id}`,
        getHeaders(),
      );
      toast.success("Story deleted");
      loadStories();
    } catch (error) {
      toast.error("Failed to delete story");
    }
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setFormData({
      coupleName: story.coupleName || "",
      brideName: story.brideName || "",
      groomName: story.groomName || "",
      story: story.story || "",
      testimonial: story.testimonial || "",
      weddingDate: story.weddingDate
        ? new Date(story.weddingDate).toISOString().split("T")[0]
        : "",
      location: story.location || "",
      photos: story.photos || [],
    });
    setSelectedImage(story.photos?.[0]?.url || null);
    setShowModal(true);
  };

  const getStatusBadge = (story) => {
    if (story.approved) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
          <FaCheck className="text-xs" /> Approved
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
        <FaClock className="text-xs" /> Pending
      </span>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark">
                Success Stories
              </h1>
              <p className="text-text-light">
                Manage success stories and testimonials
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="btn-gold flex items-center space-x-2"
            >
              <FaPlus />
              <span>Add Story</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
            </div>
          ) : stories.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
              <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark">
                No Success Stories
              </h3>
              <p className="text-text-light">Add your first success story!</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="btn-maroon inline-block mt-4"
              >
                <FaPlus className="inline mr-2" />
                Add Story
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <div
                  key={story._id}
                  className="bg-white rounded-2xl shadow-premium overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-56">
                    {story.photos && story.photos.length > 0 ? (
                      <img
                        src={story.photos[0].url}
                        alt={story.coupleName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center text-white text-4xl font-bold">
                        {story.coupleName?.charAt(0) || "S"}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {getStatusBadge(story)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-text-dark">
                      {story.coupleName}
                    </h3>
                    <p className="text-text-light text-sm">
                      {story.brideName} & {story.groomName}
                    </p>
                    <p className="text-text-light text-sm">
                      {story.location || "Location not specified"}
                    </p>
                    <p className="text-text-light text-sm">
                      <FaCalendar className="inline mr-1" />
                      {story.weddingDate
                        ? new Date(story.weddingDate).toLocaleDateString()
                        : "Date not set"}
                    </p>
                    <p className="text-text-dark text-sm mt-2 line-clamp-2">
                      {story.story}
                    </p>
                    {story.testimonial && (
                      <div className="mt-2 p-2 bg-primary-gold/10 rounded-lg">
                        <FaQuoteRight className="text-primary-gold text-xs inline mr-1" />
                        <span className="text-text-light text-sm italic">
                          {story.testimonial.slice(0, 60)}...
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(story)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        {!story.approved && (
                          <button
                            onClick={() => handleApprove(story._id)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(story._id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <Link
                        to={`/success-stories/${story._id}`}
                        className="text-primary-maroon hover:text-[#600018] text-sm flex items-center gap-1"
                      >
                        <FaEye />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Story Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-text-dark">
                {editingStory ? "Edit Success Story" : "Add Success Story"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-text-light hover:text-text-dark"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Photo Upload */}
                <div>
                  <label className="form-label">Couple Photo</label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-maroon transition-colors cursor-pointer"
                    onClick={triggerFileUpload}
                  >
                    {selectedImage ? (
                      <div className="relative">
                        <img
                          src={selectedImage}
                          alt="Couple"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                            setFormData((prev) => ({ ...prev, photos: [] }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <FaCamera className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-text-dark font-medium">
                          Click to upload photo
                        </p>
                        <p className="text-text-light text-sm">
                          JPEG, PNG, GIF (max 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Couple Name *</label>
                    <input
                      type="text"
                      name="coupleName"
                      value={formData.coupleName}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="e.g. Ravi & Sneha"
                    />
                  </div>
                  <div>
                    <label className="form-label">Wedding Date *</label>
                    <input
                      type="date"
                      name="weddingDate"
                      value={formData.weddingDate}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Bride Name *</label>
                    <input
                      type="text"
                      name="brideName"
                      value={formData.brideName}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="Bride's full name"
                    />
                  </div>
                  <div>
                    <label className="form-label">Groom Name *</label>
                    <input
                      type="text"
                      name="groomName"
                      value={formData.groomName}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="Groom's full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Bidar, Karnataka"
                  />
                </div>

                <div>
                  <label className="form-label">Story *</label>
                  <textarea
                    name="story"
                    value={formData.story}
                    onChange={handleChange}
                    className="form-input"
                    rows="4"
                    required
                    placeholder="Share their love story..."
                  />
                </div>

                <div>
                  <label className="form-label">Testimonial</label>
                  <textarea
                    name="testimonial"
                    value={formData.testimonial}
                    onChange={handleChange}
                    className="form-input"
                    rows="2"
                    placeholder="What they say about Shubha Mangalam..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-maroon flex-1 flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSave />
                  )}
                  <span>
                    {isSaving
                      ? "Saving..."
                      : editingStory
                        ? "Update Story"
                        : "Add Story"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 text-text-dark hover:border-primary-maroon transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminSuccessStoriesPage;
