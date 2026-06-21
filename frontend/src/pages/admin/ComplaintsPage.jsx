import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaExclamationTriangle,
  FaSpinner,
  FaUser,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Layout from "../../components/common/Layout";
import {
  getAllComplaints,
  updateComplaintStatus,
} from "../../store/slices/adminSlice";

const ComplaintsPage = () => {
  const dispatch = useDispatch();
  const { complaints, isLoading } = useSelector((state) => state.admin);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    dispatch(getAllComplaints({ status: filterStatus }));
  }, [dispatch, filterStatus]);

  const handleStatusUpdate = (complaintId, status) => {
    dispatch(updateComplaintStatus({ id: complaintId, status }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "investigating":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "dismissed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "fake_profile":
        return "bg-red-100 text-red-800";
      case "abuse":
        return "bg-orange-100 text-orange-800";
      case "inappropriate_content":
        return "bg-purple-100 text-purple-800";
      case "suspicious_behavior":
        return "bg-yellow-100 text-yellow-800";
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
              <h1 className="text-3xl font-bold text-text-dark">Complaints</h1>
              <p className="text-text-light">
                Manage user complaints and reports
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
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
              <FaExclamationTriangle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark">
                No Complaints
              </h3>
              <p className="text-text-light">No complaints found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="bg-white rounded-2xl shadow-premium p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                          <FaExclamationTriangle />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-dark">
                            Complaint #{complaint._id?.slice(-6)}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(complaint.type)}`}
                          >
                            {complaint.type?.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center space-x-2 text-sm text-text-light">
                          <FaUser className="text-primary-maroon" />
                          <span>
                            Reporter: {complaint.reporterId?.fullName || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-text-light">
                          <FaUser className="text-red-500" />
                          <span>
                            Target: {complaint.targetUserId?.fullName || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-text-light">
                          <FaCalendarAlt className="text-primary-maroon" />
                          <span>
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-text-dark">
                        {complaint.description}
                      </p>
                      {complaint.adminNotes && (
                        <p className="mt-2 text-sm text-blue-600">
                          Admin Notes: {complaint.adminNotes}
                        </p>
                      )}
                      {complaint.resolution && (
                        <p className="mt-2 text-sm text-green-600">
                          Resolution: {complaint.resolution}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2 mt-4 md:mt-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}
                      >
                        {complaint.status}
                      </span>
                      <div className="flex space-x-2 flex-wrap gap-2">
                        {complaint.status === "pending" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(complaint._id, "investigating")
                            }
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                          >
                            Start Investigation
                          </button>
                        )}
                        {(complaint.status === "pending" ||
                          complaint.status === "investigating") && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(complaint._id, "resolved")
                              }
                              className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center space-x-1"
                            >
                              <FaCheckCircle />
                              <span>Resolve</span>
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(complaint._id, "dismissed")
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center space-x-1"
                            >
                              <FaTimesCircle />
                              <span>Dismiss</span>
                            </button>
                          </>
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

export default ComplaintsPage;
