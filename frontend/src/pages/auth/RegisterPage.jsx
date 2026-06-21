import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaLock,
  FaArrowRight,
  FaSpinner,
  FaRing,
  FaHeart,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
} from "react-icons/fa";
import Layout from "../../components/common/Layout";
import axios from "axios";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Password validation on change
  useEffect(() => {
    const pwd = formData.password;
    setPasswordStrength({
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    });
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const getPasswordStrengthScore = () => {
    const { length, uppercase, lowercase, number, special } = passwordStrength;
    const score = [length, uppercase, lowercase, number, special].filter(
      Boolean,
    ).length;
    return score;
  };

  const getPasswordStrengthText = () => {
    const score = getPasswordStrengthScore();
    if (score === 0)
      return { text: "Enter a password", color: "text-gray-400" };
    if (score <= 2) return { text: "Weak", color: "text-red-500" };
    if (score <= 3) return { text: "Fair", color: "text-yellow-500" };
    if (score <= 4) return { text: "Good", color: "text-blue-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.mobileNumber)
      newErrors.mobileNumber = "Mobile number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    const score = getPasswordStrengthScore();
    if (formData.password && score < 3) {
      newErrors.password = "Please create a stronger password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        payload,
      );

      localStorage.setItem("token", response.data.token);

      if (response.data.user) {
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        localStorage.setItem("userMobile", formData.mobileNumber);
      }

      toast.success(
        "🎉 Registration successful! Please complete your profile.",
      );
      navigate("/complete-profile");
    } catch (error) {
      console.error("Registration error:", error);
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
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
            <FaRing className="text-7xl text-primary-maroon transform -rotate-12" />
          </div>
          <div className="absolute bottom-20 right-10 opacity-10 hidden lg:block">
            <FaHeart className="text-7xl text-primary-gold transform rotate-12" />
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-maroon to-primary-gold flex items-center justify-center shadow-lg shadow-primary-maroon/20 relative">
                <span className="text-white font-bold text-3xl">SM</span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center animate-pulse">
                  <FaHeart className="text-white text-xs" />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-text-dark">
              Create Account
            </h2>
            <p className="text-text-light mt-2 flex items-center justify-center gap-2">
              <FaRing className="text-primary-gold" />
              <span>Join Shubha Mangalam to find your perfect match</span>
              <FaRing className="text-primary-gold" />
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-primary-maroon/10 p-8 border border-primary-gold/10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label flex items-center gap-2">
                  <FaUser className="text-primary-maroon" />
                  Full Name
                </label>
                <div className="relative mt-1">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 ${
                      errors.fullName
                        ? "border-red-500"
                        : "border-gray-200 focus:border-primary-maroon"
                    } outline-none transition-all duration-300 bg-gray-50 focus:bg-white text-text-dark placeholder:text-gray-400`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <FaPhone className="text-primary-maroon" />
                  Mobile Number
                </label>
                <div className="relative mt-1">
                  <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    name="mobileNumber"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
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
                    placeholder="Create a strong password"
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
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-light">
                        Password Strength:
                      </span>
                      <span
                        className={`text-sm font-semibold ${getPasswordStrengthText().color}`}
                      >
                        {getPasswordStrengthText().text}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i <= getPasswordStrengthScore()
                              ? i <= 2
                                ? "bg-red-500"
                                : i <= 3
                                  ? "bg-yellow-500"
                                  : i <= 4
                                    ? "bg-blue-500"
                                    : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.length ? "text-green-500" : "text-gray-400"}`}
                      >
                        {passwordStrength.length ? (
                          <FaCheckCircle />
                        ) : (
                          <FaTimesCircle />
                        )}
                        <span>Min 8 characters</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.uppercase ? "text-green-500" : "text-gray-400"}`}
                      >
                        {passwordStrength.uppercase ? (
                          <FaCheckCircle />
                        ) : (
                          <FaTimesCircle />
                        )}
                        <span>Uppercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.lowercase ? "text-green-500" : "text-gray-400"}`}
                      >
                        {passwordStrength.lowercase ? (
                          <FaCheckCircle />
                        ) : (
                          <FaTimesCircle />
                        )}
                        <span>Lowercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.number ? "text-green-500" : "text-gray-400"}`}
                      >
                        {passwordStrength.number ? (
                          <FaCheckCircle />
                        ) : (
                          <FaTimesCircle />
                        )}
                        <span>Number</span>
                      </div>
                      <div
                        className={`col-span-2 flex items-center gap-1 ${passwordStrength.special ? "text-green-500" : "text-gray-400"}`}
                      >
                        {passwordStrength.special ? (
                          <FaCheckCircle />
                        ) : (
                          <FaTimesCircle />
                        )}
                        <span>Special character (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <FaLock className="text-primary-maroon" />
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-200 focus:border-primary-maroon"
                    } outline-none transition-all duration-300 bg-gray-50 focus:bg-white text-text-dark placeholder:text-gray-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-maroon transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.confirmPassword}
                  </p>
                )}
                {formData.confirmPassword &&
                  formData.password &&
                  formData.password === formData.confirmPassword && (
                    <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                      <FaCheckCircle /> Passwords match
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
                    <FaUserPlus />
                    <span>Create Account</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-text-light flex items-center justify-center gap-2">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary-maroon font-semibold hover:underline flex items-center gap-1"
                >
                  Sign In
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

export default RegisterPage;
