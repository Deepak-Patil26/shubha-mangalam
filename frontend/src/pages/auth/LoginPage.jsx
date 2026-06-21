import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaSpinner,
  FaRing,
  FaHeart,
  FaUserCheck,
} from "react-icons/fa";
import Layout from "../../components/common/Layout";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    mobileNumber: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.mobileNumber)
      newErrors.mobileNumber = "Mobile number is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData,
      );

      localStorage.setItem("token", response.data.token);

      if (response.data.user) {
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        localStorage.setItem("userMobile", formData.mobileNumber);
      }

      toast.success("Welcome back! ❤️");

      if (response.data.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 opacity-10 hidden lg:block">
            <FaRing className="text-7xl text-primary-maroon" />
          </div>
          <div className="absolute bottom-20 right-10 opacity-10 hidden lg:block">
            <FaHeart className="text-7xl text-primary-gold" />
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center shadow-lg shadow-primary-maroon/20 relative">
                <span className="text-white font-bold text-3xl">SM</span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-gold rounded-full flex items-center justify-center">
                  <FaHeart className="text-white text-xs" />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-text-dark">Welcome Back</h2>
            <p className="text-text-light mt-2 flex items-center justify-center gap-2">
              <FaRing className="text-primary-gold" />
              <span>Sign in to continue your matrimonial journey</span>
              <FaRing className="text-primary-gold" />
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-primary-maroon/10 p-8 border border-primary-gold/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="form-label flex items-center gap-2">
                  <FaEnvelope className="text-primary-maroon" />
                  Mobile Number
                </label>
                <div className="relative mt-1">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    name="mobileNumber"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 ${
                      errors.mobileNumber
                        ? "border-red-500"
                        : "border-gray-200 focus:border-primary-maroon"
                    } outline-none transition-all duration-300 bg-gray-50 focus:bg-white text-text-dark placeholder:text-gray-400`}
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.mobileNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <FaLock className="text-primary-maroon" />
                  Password
                </label>
                <div className="relative mt-1">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 ${
                      errors.password
                        ? "border-red-500"
                        : "border-gray-200 focus:border-primary-maroon"
                    } outline-none transition-all duration-300 bg-gray-50 focus:bg-white text-text-dark placeholder:text-gray-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-maroon transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-maroon flex items-center justify-center space-x-2 py-4 text-lg rounded-xl shadow-lg shadow-primary-maroon/20 hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-text-light flex items-center justify-center gap-2">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary-maroon font-semibold hover:underline flex items-center gap-1"
                >
                  Register Now
                  <FaArrowRight className="text-xs" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
