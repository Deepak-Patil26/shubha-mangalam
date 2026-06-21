const mongoose = require("mongoose");

const successStorySchema = new mongoose.Schema({
  coupleName: {
    type: String,
    required: true,
    trim: true,
  },
  brideName: {
    type: String,
    required: true,
    trim: true,
  },
  groomName: {
    type: String,
    required: true,
    trim: true,
  },
  photos: [
    {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        default: null,
      },
      isPrimary: {
        type: Boolean,
        default: false,
      },
    },
  ],
  story: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  testimonial: {
    type: String,
    maxlength: 500,
  },
  weddingDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    trim: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
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

// Indexes
successStorySchema.index({ approved: 1 });
successStorySchema.index({ featured: 1 });
successStorySchema.index({ coupleName: "text" });

module.exports = mongoose.model("SuccessStory", successStorySchema);
