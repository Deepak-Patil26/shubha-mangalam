import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUser,
  FaEdit,
  FaCamera,
  FaTrash,
  FaHeart,
  FaEye,
  FaCheckCircle,
} from "react-icons/fa";
import Layout from "../../components/common/Layout";
import {
  getMyProfile,
  deletePhoto,
  setProfilePicture,
} from "../../store/slices/profileSlice";
import { toast } from "react-toastify";

const MyProfilePage = () => {
  const dispatch = useDispatch();
  const { currentProfile, completionPercentage, isLoading } = useSelector(
    (state) => state.profile,
  );
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-maroon border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!currentProfile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-dark">
              No Profile Found
            </h2>
            <p className="text-text-light mt-2">Please complete your profile</p>
          </div>
        </div>
      </Layout>
    );
  }

  const profile = currentProfile;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark">My Profile</h1>
              <p className="text-text-light">Manage your matrimonial profile</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-gold flex items-center space-x-2"
            >
              <FaEdit />
              <span>{isEditing ? "View Mode" : "Edit Profile"}</span>
            </button>
          </div>

          {/* Profile Completion */}
          <div className="bg-white rounded-2xl shadow-premium p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-dark">
                  Profile Completion
                </h3>
                <p className="text-text-light text-sm">
                  Complete your profile to appear in searches
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-primary-maroon">
                  {completionPercentage}%
                </span>
                {completionPercentage >= 70 && (
                  <span className="flex items-center text-green-500">
                    <FaCheckCircle className="mr-1" />
                    Public
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div
                className="bg-gradient-to-r from-primary-maroon to-primary-gold h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Photo */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-premium p-6">
                <div className="relative">
                  <img
                    src={
                      profile.photos?.find((p) => p.isProfilePicture)?.url ||
                      "/api/placeholder/400/400"
                    }
                    alt={profile.personalDetails?.fullName}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    className="absolute bottom-4 right-4 bg-primary-maroon text-white p-3 rounded-full hover:bg-[#600018] transition-colors"
                    onClick={() =>
                      document.getElementById("photoUpload").click()
                    }
                  >
                    <FaCamera />
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-bold text-text-dark">
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
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-premium p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-light text-sm">Religion</p>
                    <p className="text-text-dark font-medium">
                      {profile.personalDetails?.religion}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Caste</p>
                    <p className="text-text-dark font-medium">
                      {profile.personalDetails?.caste}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Mother Tongue</p>
                    <p className="text-text-dark font-medium">
                      {profile.personalDetails?.motherTongue}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Education</p>
                    <p className="text-text-dark font-medium">
                      {profile.personalDetails?.education}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Occupation</p>
                    <p className="text-text-dark font-medium">
                      {profile.personalDetails?.occupation}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Annual Income</p>
                    <p className="text-text-dark font-medium">
                      ₹{profile.personalDetails?.annualIncome?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Height</p>
                    <p className="text-text-dark font-medium">
                      {profile.personalDetails?.height} cm
                    </p>
                  </div>
                  <div>
                    <p className="text-text-light text-sm">Weight</p>
                    <p className="text-text-dark font-medium">
                      {profile.personalDetails?.weight} kg
                    </p>
                  </div>
                </div>

                {profile.personalDetails?.aboutMe && (
                  <div className="mt-4">
                    <p className="text-text-light text-sm">About Me</p>
                    <p className="text-text-dark">
                      {profile.personalDetails.aboutMe}
                    </p>
                  </div>
                )}
              </div>

              {/* Family Details */}
              <div className="bg-white rounded-2xl shadow-premium p-6 mt-6">
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

              {/* Photos Gallery */}
              {profile.photos && profile.photos.length > 0 && (
                <div className="bg-white rounded-2xl shadow-premium p-6 mt-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4">
                    Photos
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.photos.map((photo, index) => (
                      <div key={photo._id || index} className="relative group">
                        <img
                          src={photo.url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        {photo.isProfilePicture && (
                          <div className="absolute top-2 left-2 bg-primary-gold text-white text-xs px-2 py-1 rounded">
                            Profile
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this photo?")) {
                              dispatch(deletePhoto(photo._id));
                            }
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                        {!photo.isProfilePicture && (
                          <button
                            onClick={() =>
                              dispatch(setProfilePicture(photo._id))
                            }
                            className="absolute bottom-2 left-2 bg-primary-maroon text-white text-xs px-2 py-1 rounded hover:bg-[#600018] transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Set as Profile
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyProfilePage;
