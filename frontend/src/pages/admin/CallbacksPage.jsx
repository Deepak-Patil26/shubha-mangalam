import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaPhone,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import Layout from "../../components/common/Layout";
import {
  getAllCallbacks,
  updateCallbackStatus,
} from "../../store/slices/adminSlice";

const CallbacksPage = () => {
  const dispatch = useDispatch();
  const { callbacks, isLoading } = useSelector((state) => state.admin);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    dispatch(getAllCallbacks({ status: filterStatus }));
  }, [dispatch, filterStatus]);

  const handleStatusUpdate = (callbackId, status) => {
    dispatch(updateCallbackStatus({ id: callbackId, status }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark">
                Callback Requests
              </h1>
              <p className="text-text-light">
                Manage all callback requests from users
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-premium p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-maroon outline-none transition-colors"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
            </div>
          ) : callbacks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
              <FaPhone className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark">
                No Callbacks
              </h3>
              <p className="text-text-light">No callback requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {callbacks.map((callback) => (
                <div
                  key={callback._id}
                  className="bg-white rounded-2xl shadow-premium p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center text-white font-semibold">
                          {callback.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-dark">
                            {callback.name}
                          </h3>
                          <p className="text-text-light text-sm">
                            {callback.phoneNumber}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center space-x-2 text-sm text-text-light">
                          <FaUser className="text-primary-maroon" />
                          <span>
                            User: {callback.userId?.fullName || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-text-light">
                          <FaCalendarAlt className="text-primary-maroon" />
                          <span>
                            {new Date(callback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {callback.message && (
                        <p className="mt-2 text-text-dark italic">
                          "{callback.message}"
                        </p>
                      )}
                      {callback.notes && (
                        <p className="mt-2 text-sm text-text-light">
                          Notes: {callback.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2 mt-4 md:mt-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(callback.status)}`}
                      >
                        {callback.status}
                      </span>
                      <div className="flex space-x-2">
                        {callback.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(callback._id, "contacted")
                              }
                              className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                            >
                              Mark Contacted
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(callback._id, "cancelled")
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {callback.status === "contacted" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(callback._id, "resolved")
                            }
                            className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center space-x-1"
                          >
                            <FaCheckCircle />
                            <span>Resolve</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CallbacksPage;
