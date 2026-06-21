import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaEnvelope,
  FaCheck,
  FaTimes,
  FaClock,
  FaSpinner,
} from "react-icons/fa";
import Layout from "../../components/common/Layout";
import {
  getReceivedInterests,
  getSentInterests,
  acceptInterest,
  rejectInterest,
  cancelInterest,
} from "../../store/slices/interestSlice";

const InterestsPage = () => {
  const dispatch = useDispatch();
  const { receivedInterests, sentInterests, isLoading } = useSelector(
    (state) => state.interest,
  );
  const [activeTab, setActiveTab] = useState("received");

  useEffect(() => {
    if (activeTab === "received") {
      dispatch(getReceivedInterests({ status: "pending" }));
    } else {
      dispatch(getSentInterests({ status: "pending" }));
    }
  }, [dispatch, activeTab]);

  const handleAccept = (interestId) => {
    dispatch(acceptInterest(interestId));
  };

  const handleReject = (interestId) => {
    dispatch(rejectInterest(interestId));
  };

  const handleCancel = (interestId) => {
    dispatch(cancelInterest(interestId));
  };

  const interests =
    activeTab === "received" ? receivedInterests : sentInterests;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-text-dark mb-8">Interests</h1>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab("received")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "received"
                  ? "bg-primary-maroon text-white"
                  : "bg-white text-text-dark hover:bg-gray-50"
              }`}
            >
              Received ({receivedInterests.length})
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "sent"
                  ? "bg-primary-maroon text-white"
                  : "bg-white text-text-dark hover:bg-gray-50"
              }`}
            >
              Sent ({sentInterests.length})
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
            </div>
          ) : interests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
              <FaEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark">
                No Interests
              </h3>
              <p className="text-text-light">
                You have no {activeTab} interests at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {interests.map((interest) => (
                <div
                  key={interest._id}
                  className="bg-white rounded-2xl shadow-premium p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-text-dark">
                        {activeTab === "received"
                          ? interest.senderId?.fullName
                          : interest.receiverId?.fullName}
                      </h3>
                      <p className="text-text-light text-sm">
                        {activeTab === "received"
                          ? interest.senderId?.mobileNumber
                          : interest.receiverId?.mobileNumber}
                      </p>
                      <p className="text-text-light text-sm mt-2">
                        <FaClock className="inline mr-1" />
                        {new Date(interest.createdAt).toLocaleDateString()}
                      </p>
                      {interest.message && (
                        <p className="text-text-dark mt-2 italic">
                          "{interest.message}"
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
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
                  </div>

                  {interest.status === "pending" &&
                    activeTab === "received" && (
                      <div className="mt-4 flex space-x-3">
                        <button
                          onClick={() => handleAccept(interest._id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                        >
                          <FaCheck />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleReject(interest._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                        >
                          <FaTimes />
                          <span>Reject</span>
                        </button>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InterestsPage;
