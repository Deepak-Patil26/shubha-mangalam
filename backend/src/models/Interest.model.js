const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending",
  },
  message: {
    type: String,
    maxlength: 500,
  },
  callbackRequested: {
    type: Boolean,
    default: false,
  },
  callbackDetails: {
    name: String,
    phoneNumber: String,
    requestedAt: Date,
    status: {
      type: String,
      enum: ["pending", "contacted", "resolved"],
      default: "pending",
    },
  },
  brokerNotified: {
    type: Boolean,
    default: false,
  },
  notifiedAt: {
    type: Date,
  },
  respondedAt: {
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

// Ensure unique interest per sender-receiver pair
interestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
interestSchema.index({ senderId: 1 });
interestSchema.index({ receiverId: 1 });
interestSchema.index({ status: 1 });

module.exports = mongoose.model("Interest", interestSchema);
