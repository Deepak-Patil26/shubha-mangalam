import React, { useState, useEffect } from "react";
import Layout from "../../components/common/Layout";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaHeart,
  FaStar,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
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

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/admin/testimonials`,
        getHeaders(),
      );
      setTestimonials(response.data.testimonials || []);
    } catch (error) {
      console.error("Error loading testimonials:", error);
      toast.error("Failed to load testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await axios.put(
          `${API_URL}/admin/testimonials/${editingTestimonial._id}`,
          formData,
          getHeaders(),
        );
        toast.success("Testimonial updated successfully");
      } else {
        await axios.post(
          `${API_URL}/admin/testimonials`,
          formData,
          getHeaders(),
        );
        toast.success("Testimonial created successfully");
      }
      setShowModal(false);
      setEditingTestimonial(null);
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
      loadTestimonials();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      await axios.delete(`${API_URL}/admin/testimonials/${id}`, getHeaders());
      toast.success("Testimonial deleted");
      loadTestimonials();
    } catch (error) {
      toast.error("Failed to delete testimonial");
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      coupleName: testimonial.coupleName || "",
      brideName: testimonial.brideName || "",
      groomName: testimonial.groomName || "",
      story: testimonial.story || "",
      testimonial: testimonial.testimonial || "",
      weddingDate: testimonial.weddingDate
        ? testimonial.weddingDate.split("T")[0]
        : "",
      location: testimonial.location || "",
      photos: testimonial.photos || [],
    });
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark">
                Testimonials
              </h1>
              <p className="text-text-light">Manage member testimonials</p>
            </div>
            <button
              onClick={() => {
                setEditingTestimonial(null);
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
                setShowModal(true);
              }}
              className="btn-gold flex items-center space-x-2"
            >
              <FaPlus />
              <span>Add Testimonial</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
            </div>
          ) : testimonials.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
              <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark">
                No Testimonials
              </h3>
              <p className="text-text-light">Add your first testimonial!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial._id}
                  className="bg-white rounded-2xl shadow-premium overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48">
                    {testimonial.photos && testimonial.photos.length > 0 ? (
                      <img
                        src={testimonial.photos[0].url}
                        alt={testimonial.coupleName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center">
                        <FaHeart className="text-white text-5xl opacity-50" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h3 className="text-white font-bold text-lg">
                        {testimonial.coupleName}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-primary-gold text-sm" />
                      ))}
                    </div>
                    <p className="text-text-light text-sm italic line-clamp-3">
                      "{testimonial.testimonial}"
                    </p>
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(testimonial)}
                        className="text-blue-500 hover:text-blue-700 p-2"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial._id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-text-dark">
                {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-light hover:text-text-dark"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Couple Name *</label>
                <input
                  type="text"
                  value={formData.coupleName}
                  onChange={(e) =>
                    setFormData({ ...formData, coupleName: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Bride Name</label>
                  <input
                    type="text"
                    value={formData.brideName}
                    onChange={(e) =>
                      setFormData({ ...formData, brideName: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Groom Name</label>
                  <input
                    type="text"
                    value={formData.groomName}
                    onChange={(e) =>
                      setFormData({ ...formData, groomName: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Testimonial *</label>
                <textarea
                  value={formData.testimonial}
                  onChange={(e) =>
                    setFormData({ ...formData, testimonial: e.target.value })
                  }
                  className="form-input"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="form-label">Story</label>
                <textarea
                  value={formData.story}
                  onChange={(e) =>
                    setFormData({ ...formData, story: e.target.value })
                  }
                  className="form-input"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Wedding Date</label>
                  <input
                    type="date"
                    value={formData.weddingDate}
                    onChange={(e) =>
                      setFormData({ ...formData, weddingDate: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-maroon flex-1">
                  {editingTestimonial ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

export default AdminTestimonials;
