import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaHeart,
  FaEye,
  FaPhone,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaCalendar,
  FaGraduationCap,
  FaBriefcase,
  FaMoneyBillWave,
  FaRulerVertical,
  FaWeight,
  FaUsers,
  FaHome,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Layout from "../../components/common/Layout";
import { getProfileById, saveProfile } from "../../store/slices/profileSlice";
import { sendInterest } from "../../store/slices/interestSlice";
import { toast } from "react-toastify";

const ViewProfilePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { viewingProfile, isLoading } = useSelector((state) => state.profile);
  const { user } = useSelector((state) => state.auth);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [callbackData, setCallbackData] = useState({
    name: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (id) {
      dispatch(getProfileById(id));
    }
  }, [id, dispatch]);

  const handleSendInterest = async () => {
    await dispatch(
      sendInterest({
        receiverId: viewingProfile?.user?._id,
        requestCallback: true,
        callbackName: callbackData.name || user?.fullName,
        callbackPhone: callbackData.phoneNumber || user?.mobileNumber,
      }),
    );
    setShowInterestModal(false);
  };

  const handleSaveProfile = () => {
    dispatch(saveProfile(id));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-maroon border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!viewingProfile || !viewingProfile.profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-dark">
              Profile Not Found
            </h2>
            <button onClick={() => navigate(-1)} className="btn-maroon mt-4">
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const profile = viewingProfile.profile;
  const profileUser = viewingProfile.user;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-text-dark hover:text-primary-maroon mb-6"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Photo & Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-premium p-6 sticky top-24">
                <img
                  src={
                    profile.photos?.find((p) => p.isProfilePicture)?.url ||
                    "/api/placeholder/400/400"
                  }
                  alt={profile.personalDetails?.fullName}
                  className="w-full h-64 object-cover rounded-xl"
                />
                <div className="mt-4 text-center">
                  <h2 className="text-2xl font-bold text-text-dark">
                    {profile.personalDetails?.fullName}
                  </h2>
                  <p className="text-text-light">
                    {profile.personalDetails?.age} years •{" "}
                    {profile.personalDetails?.gender}
                  </p>
                  <p className="text-text-light">
                    {profile.personalDetails?.location?.city},{" "}
                    {profile.personalDetails?.location?.state}
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => setShowInterestModal(true)}
                    className="btn-maroon w-full flex items-center justify-center space-x-2"
                  >
                    <FaHeart />
                    <span>Interested</span>
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="btn-gold w-full flex items-center justify-center space-x-2"
                  >
                    <FaHeart />
                    <span>Save Profile</span>
                  </button>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-text-light text-center">
                    Contact details are hidden. Send interest to connect through
                    broker.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Details */}
              <div className="bg-white rounded-2xl shadow-premium p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <FaCalendar className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Age</p>
                      <p className="text-text-dark font-medium">
                        {profile.personalDetails?.age} years
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaUsers className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Marital Status</p>
                      <p className="text-text-dark font-medium capitalize">
                        {profile.personalDetails?.maritalStatus}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaGraduationCap className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Education</p>
                      <p className="text-text-dark font-medium">
                        {profile.personalDetails?.education}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaBriefcase className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Occupation</p>
                      <p className="text-text-dark font-medium">
                        {profile.personalDetails?.occupation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaMoneyBillWave className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Annual Income</p>
                      <p className="text-text-dark font-medium">
                        ₹
                        {profile.personalDetails?.annualIncome?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaRulerVertical className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Height</p>
                      <p className="text-text-dark font-medium">
                        {profile.personalDetails?.height} cm
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaWeight className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Weight</p>
                      <p className="text-text-dark font-medium">
                        {profile.personalDetails?.weight} kg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaMapMarkerAlt className="text-primary-maroon mt-1" />
                    <div>
                      <p className="text-text-light text-sm">Location</p>
                      <p className="text-text-dark font-medium">
                        {profile.personalDetails?.location?.city},{" "}
                        {profile.personalDetails?.location?.state}
                      </p>
                    </div>
                  </div>
                </div>
                {profile.personalDetails?.aboutMe && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-text-light text-sm">About Me</p>
                    <p className="text-text-dark">
                      {profile.personalDetails.aboutMe}
                    </p>
                  </div>
                )}
              </div>

              {/* Family Details */}
              <div className="bg-white rounded-2xl shadow-premium p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  Family Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-light text-sm">Father's Name</p>
                    <p className="text-text-dark font-medium">
                      {profile.familyDetails?.fatherName}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Mother's Name</p>
                    <p className="text-text-dark font-medium">
                      {profile.familyDetails?.motherName}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Brothers</p>
                    <p className="text-text-dark font-medium">
                      {profile.familyDetails?.brothers || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Sisters</p>
                    <p className="text-text-dark font-medium">
                      {profile.familyDetails?.sisters || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Family Background</p>
                    <p className="text-text-dark font-medium capitalize">
                      {profile.familyDetails?.familyBackground}
                    </p>
                  </div>
                </div>
              </div>

              {/* Partner Preferences */}
              <div className="bg-white rounded-2xl shadow-premium p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  Partner Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-light text-sm">Age Range</p>
                    <p className="text-text-dark font-medium">
                      {profile.partnerPreferences?.ageRange?.min} -{" "}
                      {profile.partnerPreferences?.ageRange?.max} years
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Religion</p>
                    <p className="text-text-dark font-medium">
                      {profile.partnerPreferences?.religion}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Caste</p>
                    <p className="text-text-dark font-medium">
                      {profile.partnerPreferences?.caste}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Education</p>
                    <p className="text-text-dark font-medium">
                      {profile.partnerPreferences?.education}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Occupation</p>
                    <p className="text-text-dark font-medium">
                      {profile.partnerPreferences?.occupation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Details (if exists) */}
              {(profile.propertyDetails?.hasAgriculturalLand ||
                profile.propertyDetails?.hasResidentialProperty ||
                profile.propertyDetails?.hasCommercialProperty) && (
                <div className="bg-white rounded-2xl shadow-premium p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4">
                    Property Details
                  </h3>
                  <div className="space-y-2">
                    {profile.propertyDetails?.hasAgriculturalLand && (
                      <p>
                        Agricultural Land:{" "}
                        {profile.propertyDetails?.agriculturalLandAcres} acres
                      </p>
                    )}
                    {profile.propertyDetails?.hasResidentialProperty && (
                      <p>
                        Residential Property:{" "}
                        {profile.propertyDetails?.residentialPropertyDetails}
                      </p>
                    )}
                    {profile.propertyDetails?.hasCommercialProperty && (
                      <p>
                        Commercial Property:{" "}
                        {profile.propertyDetails?.commercialPropertyDetails}
                      </p>
                    )}
                    {profile.propertyDetails?.otherAssets && (
                      <p>
                        Other Assets: {profile.propertyDetails?.otherAssets}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Photos Gallery */}
              {profile.photos && profile.photos.length > 0 && (
                <div className="bg-white rounded-2xl shadow-premium p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4">
                    Photos
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.photos.map((photo, index) => (
                      <img
                        key={photo._id || index}
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interest Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-text-dark mb-4">
              Connect with Broker
            </h3>
            <p className="text-text-light mb-4">
              The broker will facilitate the connection between both families.
            </p>

            <div className="space-y-4">
              <div>
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  value={callbackData.name || user?.fullName || ""}
                  onChange={(e) =>
                    setCallbackData({ ...callbackData, name: e.target.value })
                  }
                  className="form-input"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  value={callbackData.phoneNumber || user?.mobileNumber || ""}
                  onChange={(e) =>
                    setCallbackData({
                      ...callbackData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col space-y-3">
              <button
                onClick={handleSendInterest}
                className="btn-maroon w-full"
              >
                Send Interest & Request Callback
              </button>
              <a
                href="tel:+919110480411"
                className="btn-gold w-full flex items-center justify-center space-x-2"
              >
                <FaPhone />
                <span>Call Broker</span>
              </a>
              <a
                href="https://wa.me/918123427060"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white w-full py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors"
              >
                <FaWhatsapp />
                <span>WhatsApp Broker</span>
              </a>
              <button
                onClick={() => setShowInterestModal(false)}
                className="text-text-light hover:text-text-dark"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ViewProfilePage;
