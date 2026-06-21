import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaHeart, FaSpinner, FaUser } from "react-icons/fa";
import Layout from "../../components/common/Layout";
import { getSavedProfiles } from "../../store/slices/profileSlice";

const SavedProfilesPage = () => {
  const dispatch = useDispatch();
  const { savedProfiles, isLoading } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(getSavedProfiles());
  }, [dispatch]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center space-x-3 mb-8">
            <FaHeart className="text-3xl text-primary-maroon" />
            <h1 className="text-3xl font-bold text-text-dark">
              Saved Profiles
            </h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
            </div>
          ) : savedProfiles.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
              <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark">
                No Saved Profiles
              </h3>
              <p className="text-text-light">
                Start saving profiles you're interested in.
              </p>
              <Link to="/search" className="btn-maroon inline-block mt-4">
                Browse Profiles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProfiles.map((profile) => (
                <Link to={`/profile/${profile._id}`} key={profile._id}>
                  <div className="bg-white rounded-2xl shadow-premium overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="relative h-48">
                      <img
                        src={
                          profile.photos?.find((p) => p.isProfilePicture)
                            ?.url || "/api/placeholder/400/300"
                        }
                        alt={profile.personalDetails?.fullName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-primary-maroon text-white p-2 rounded-full">
                        <FaHeart />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-text-dark">
                        {profile.personalDetails?.fullName}
                      </h3>
                      <p className="text-text-light text-sm">
                        {profile.personalDetails?.age} years •{" "}
                        {profile.personalDetails?.gender}
                      </p>
                      <p className="text-text-light text-sm">
                        {profile.personalDetails?.location?.city},{" "}
                        {profile.personalDetails?.location?.state}
                      </p>
                      <div className="mt-2 flex items-center space-x-2 text-sm text-text-light">
                        <FaUser />
                        <span>{profile.personalDetails?.occupation}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SavedProfilesPage;
