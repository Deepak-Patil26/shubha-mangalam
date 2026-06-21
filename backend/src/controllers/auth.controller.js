const User = require("../models/User.model");
const Profile = require("../models/Profile.model");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      mobile: user.mobileNumber,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE },
  );
};

// Register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, mobileNumber, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ mobileNumber });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this mobile number" });
    }

    // Create new user
    const user = new User({
      fullName,
      mobileNumber,
      password,
      role: "user",
      profileType: "self_registered",
      isActive: true,
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "Registration successful",
      token,
      user: userResponse,
      requiresProfileCompletion: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobileNumber, password } = req.body;

    // Find user
    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(403).json({ message: "Account has been suspended" });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Check if profile exists and is complete
    const profile = await Profile.findOne({ userId: user._id });
    const requiresProfileCompletion = !profile || !profile.isProfileComplete;

    // Generate token
    const token = generateToken(user);

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
      requiresProfileCompletion,
      profileId: profile ? profile._id : null,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res
      .status(500)
      .json({ message: "Failed to change password", error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await Profile.findOne({ userId: user._id });

    res.status(200).json({
      user,
      profile: profile || null,
      hasProfile: !!profile,
      profileCompletion: profile ? profile.profileCompletionPercentage : 0,
      isProfileComplete: profile ? profile.isProfileComplete : false,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res
      .status(500)
      .json({ message: "Failed to get user", error: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // JWT is stateless, so we just send a success response
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};
