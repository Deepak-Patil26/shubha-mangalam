const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  type: {
    type: String,
    enum: [
      "fake_profile",
      "abuse",
      "inappropriate_content",
      "suspicious_behavior",
      "other",
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  evidence: [
    {
      type: String, // URLs to uploaded evidence
    },
  ],
  status: {
    type: String,
    enum: ["pending", "investigating", "resolved", "dismissed"],
    default: "pending",
  },
  adminNotes: {
    type: String,
  },
  resolution: {
    type: String,
  },
  resolvedAt: {
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
});

complaintSchema.index({ reporterId: 1 });
complaintSchema.index({ targetUserId: 1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);
