const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User.model");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if admin exists
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    // Create admin
    const admin = new User({
      fullName: "Admin Shubha Mangalam",
      mobileNumber: process.env.ADMIN_MOBILE || "9876543210",
      password: process.env.ADMIN_PASSWORD || "Admin@123",
      role: "admin",
      profileType: "self_registered",
      isActive: true,
      isVerified: true,
    });

    await admin.save();
    console.log("✅ Admin created successfully");
    console.log(`📱 Mobile: ${admin.mobileNumber}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || "Admin@123"}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedAdmin();
