import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUsers,
  FaUserCheck,
  FaHeart,
  FaPhone,
  FaExclamationTriangle,
  FaStar,
  FaSpinner,
  FaCalendarAlt,
  FaUserPlus,
} from "react-icons/fa";
import Layout from "../../components/common/Layout";
import { getDashboardStats } from "../../store/slices/adminSlice";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.users?.total || 0,
      icon: FaUsers,
      color: "bg-blue-500",
    },
    {
      title: "Active Users",
      value: stats?.users?.active || 0,
      icon: FaUserCheck,
      color: "bg-green-500",
    },
    {
      title: "Total Profiles",
      value: stats?.profiles?.total || 0,
      icon: FaUserPlus,
      color: "bg-purple-500",
    },
    {
      title: "Interests",
      value: stats?.interests?.total || 0,
      icon: FaHeart,
      color: "bg-red-500",
    },
    {
      title: "Callbacks",
      value: stats?.callbacks?.total || 0,
      icon: FaPhone,
      color: "bg-yellow-500",
    },
    {
      title: "Complaints",
      value: stats?.complaints?.total || 0,
      icon: FaExclamationTriangle,
      color: "bg-orange-500",
    },
    {
      title: "Success Stories",
      value: stats?.successStories || 0,
      icon: FaStar,
      color: "bg-primary-gold",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-dark">
              Admin Dashboard
            </h1>
            <p className="text-text-light">
              Overview of your matrimony platform
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-premium p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-light text-sm">{stat.title}</p>
                      <p className="text-3xl font-bold text-text-dark mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <Icon className="text-white text-xl" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Profile Completion Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-premium p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                Profile Completion
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-text-light text-sm">
                      Average Completion
                    </span>
                    <span className="text-text-dark font-medium">
                      {stats?.profiles?.averageCompletion || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-primary-maroon to-primary-gold h-2.5 rounded-full"
                      style={{
                        width: `${stats?.profiles?.averageCompletion || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-light">
                    Complete Profiles:{" "}
                    <span className="text-green-500 font-medium">
                      {stats?.profiles?.completeProfiles || 0}
                    </span>
                  </span>
                  <span className="text-text-light">
                    Incomplete Profiles:{" "}
                    <span className="text-red-500 font-medium">
                      {stats?.profiles?.incompleteProfiles || 0}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-premium p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <FaUserPlus className="text-primary-maroon" />
                  <span className="text-text-dark">
                    {stats?.users?.total || 0} total users registered
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <FaHeart className="text-red-500" />
                  <span className="text-text-dark">
                    {stats?.interests?.total || 0} total interests sent
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <FaPhone className="text-yellow-500" />
                  <span className="text-text-dark">
                    {stats?.callbacks?.pending || 0} pending callbacks
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <FaExclamationTriangle className="text-orange-500" />
                  <span className="text-text-dark">
                    {stats?.complaints?.pending || 0} pending complaints
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-premium p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
                <FaUsers className="text-2xl text-primary-maroon mx-auto mb-2" />
                <span className="text-sm text-text-dark">Manage Users</span>
              </button>
              <button className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
                <FaPhone className="text-2xl text-primary-maroon mx-auto mb-2" />
                <span className="text-sm text-text-dark">View Callbacks</span>
              </button>
              <button className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
                <FaExclamationTriangle className="text-2xl text-primary-maroon mx-auto mb-2" />
                <span className="text-sm text-text-dark">
                  Handle Complaints
                </span>
              </button>
              <button className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
                <FaStar className="text-2xl text-primary-maroon mx-auto mb-2" />
                <span className="text-sm text-text-dark">Success Stories</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
