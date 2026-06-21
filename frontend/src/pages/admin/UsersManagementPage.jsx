import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaSearch,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaSpinner,
  FaEye,
  FaWhatsapp,
  FaEdit,
  FaBan,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Layout from "../../components/common/Layout";
import {
  getAllUsers,
  suspendUser,
  unsuspendUser,
  deleteUser,
} from "../../store/slices/adminSlice";
import { toast } from "react-toastify";

const UsersManagementPage = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    dispatch(getAllUsers({ search: searchTerm, status: filterStatus }));
  }, [dispatch, searchTerm, filterStatus]);

  const handleSuspend = (userId) => {
    if (window.confirm("Are you sure you want to suspend this user?")) {
      dispatch(suspendUser(userId));
    }
  };

  const handleUnsuspend = (userId) => {
    dispatch(unsuspendUser(userId));
  };

  const handleDelete = (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This cannot be undone!",
      )
    ) {
      dispatch(deleteUser(userId));
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark">
                Member Directory
              </h1>
              <p className="text-text-light">Manage all registered members</p>
            </div>
            <button className="btn-maroon flex items-center space-x-2">
              <FaUser />
              <span>Add Member</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-2xl shadow-premium p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or mobile number..."
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
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
              <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
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
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Profile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center text-white font-semibold">
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
                        <td className="px-6 py-4 text-text-dark">
                          <div className="flex items-center space-x-1">
                            <FaMapMarkerAlt className="text-text-light text-xs" />
                            <span>{user.location || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.isSuspended ? (
                            <span className="flex items-center text-red-500">
                              <FaTimesCircle className="mr-1" />
                              Suspended
                            </span>
                          ) : user.isActive ? (
                            <span className="flex items-center text-green-500">
                              <FaCheckCircle className="mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-500">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${user.profileCompletion >= 70 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {user.profileCompletion || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <FaEye />
                            </button>
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
                            <button
                              className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
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
                              onClick={() => handleDelete(user._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
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
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UsersManagementPage;
