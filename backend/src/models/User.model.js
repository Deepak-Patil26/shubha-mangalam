const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Remove this or make it optional without unique
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true, // This allows multiple null values
    default: null,
  },
  role: {
    type: String,
    enum: ["user", "admin", "broker"],
    default: "user",
  },
  profileType: {
    type: String,
    enum: ["self_registered", "broker_added"],
    default: "self_registered",
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  profileCompletionPercentage: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  preferences: {
    language: {
      type: String,
      default: "en",
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ mobileNumber: 1 });
userSchema.index({ fullName: "text" });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isSuspended: 1 });

module.exports = mongoose.model("User", userSchema);
