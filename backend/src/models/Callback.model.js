const mongoose = require("mongoose");

const callbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  message: {
    type: String,
    maxlength: 500,
  },
  preferredTime: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "contacted", "resolved", "cancelled"],
    default: "pending",
  },
  notes: {
    type: String,
  },
  brokerNotes: {
    type: String,
  },
  contactedAt: {
    type: Date,
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

callbackSchema.index({ userId: 1 });
callbackSchema.index({ phoneNumber: 1 });
callbackSchema.index({ status: 1 });

module.exports = mongoose.model("Callback", callbackSchema);
