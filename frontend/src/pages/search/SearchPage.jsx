import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaSpinner,
  FaHeart,
  FaUser,
  FaMapMarkerAlt,
  FaCalendar,
  FaGraduationCap,
  FaBriefcase,
} from "react-icons/fa";
import Layout from "../../components/common/Layout";
import {
  searchProfiles,
  getSearchFilters,
} from "../../store/slices/searchSlice";

const SearchPage = () => {
  const dispatch = useDispatch();
  const { results, filters, pagination, isLoading } = useSelector(
    (state) => state.search,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState({
    query: "",
    gender: "",
    ageMin: "",
    ageMax: "",
    religion: "",
    caste: "",
    education: "",
    occupation: "",
    state: "",
    city: "",
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    dispatch(getSearchFilters());
    dispatch(searchProfiles(searchParams));
  }, [dispatch, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(searchProfiles({ ...searchParams, page: 1 }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-text-dark mb-8">
            Search Profiles
          </h1>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-premium p-4 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="query"
                  value={searchParams.query}
                  onChange={handleFilterChange}
                  placeholder="Search by name, location, education..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-maroon outline-none transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-primary-maroon transition-colors flex items-center space-x-2"
              >
                <FaFilter />
                <span>Filters</span>
              </button>
              <button type="submit" className="btn-maroon px-8 py-3">
                Search
              </button>
            </div>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-2xl shadow-premium p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    value={searchParams.gender}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    <option value="">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Religion</label>
                  <select
                    name="religion"
                    value={searchParams.religion}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    <option value="">All</option>
                    {filters.religions?.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Caste</label>
                  <select
                    name="caste"
                    value={searchParams.caste}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    <option value="">All</option>
                    {filters.castes?.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Min Age</label>
                  <input
                    type="number"
                    name="ageMin"
                    value={searchParams.ageMin}
                    onChange={handleFilterChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Max Age</label>
                  <input
                    type="number"
                    name="ageMax"
                    value={searchParams.ageMax}
                    onChange={handleFilterChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Education</label>
                  <select
                    name="education"
                    value={searchParams.education}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    <option value="">All</option>
                    {filters.educations?.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Occupation</label>
                  <select
                    name="occupation"
                    value={searchParams.occupation}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    <option value="">All</option>
                    {filters.occupations?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">State</label>
                  <select
                    name="state"
                    value={searchParams.state}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    <option value="">All</option>
                    {filters.states?.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">City</label>
                  <select
                    name="city"
                    value={searchParams.city}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    <option value="">All</option>
                    {filters.cities?.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="text-4xl text-primary-maroon animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-premium p-12 text-center">
              <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark">
                No Profiles Found
              </h3>
              <p className="text-text-light">
                Try adjusting your search filters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((profile) => (
                  <Link
                    to={`/profile/${profile._id}`}
                    key={profile._id}
                    className="block"
                  >
                    <div className="bg-white rounded-2xl shadow-premium overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                      <div className="relative h-48">
                        <img
                          src={
                            profile.photos?.find((p) => p.isProfilePicture)
                              ?.url || "/api/placeholder/400/300"
                          }
                          alt={profile.personalDetails?.fullName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-lg">
                          <FaHeart className="text-primary-maroon" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-text-dark">
                          {profile.personalDetails?.fullName}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-text-light mt-1">
                          <FaCalendar className="text-primary-maroon" />
                          <span>{profile.personalDetails?.age} years</span>
                          <span>•</span>
                          <span>{profile.personalDetails?.gender}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-text-light mt-1">
                          <FaMapMarkerAlt className="text-primary-maroon" />
                          <span>{profile.personalDetails?.location?.city}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-text-light mt-1">
                          <FaGraduationCap className="text-primary-maroon" />
                          <span>{profile.personalDetails?.education}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-text-light mt-1">
                          <FaBriefcase className="text-primary-maroon" />
                          <span>{profile.personalDetails?.occupation}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`px-4 py-2 rounded-xl ${
                      pagination.currentPage === 1
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white text-text-dark hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-primary-maroon text-white rounded-xl">
                    {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-4 py-2 rounded-xl ${
                      pagination.currentPage === pagination.totalPages
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white text-text-dark hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
