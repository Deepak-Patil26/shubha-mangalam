const Profile = require("../models/Profile.model");
const User = require("../models/User.model");
const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create or update profile - NO VALIDATION
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Parse data - handle empty values gracefully
    if (profileData.personalDetails) {
      if (profileData.personalDetails.age) {
        profileData.personalDetails.age =
          parseInt(profileData.personalDetails.age) || 0;
      }
      if (profileData.personalDetails.annualIncome) {
        profileData.personalDetails.annualIncome =
          parseInt(profileData.personalDetails.annualIncome) || 0;
      }
      if (profileData.personalDetails.height) {
        profileData.personalDetails.height =
          parseInt(profileData.personalDetails.height) || 0;
      }
      if (profileData.personalDetails.weight) {
        profileData.personalDetails.weight =
          parseInt(profileData.personalDetails.weight) || 0;
      }
    }

    if (profileData.familyDetails) {
      if (profileData.familyDetails.brothers) {
        profileData.familyDetails.brothers =
          parseInt(profileData.familyDetails.brothers) || 0;
      }
      if (profileData.familyDetails.sisters) {
        profileData.familyDetails.sisters =
          parseInt(profileData.familyDetails.sisters) || 0;
      }
    }

    if (profileData.propertyDetails) {
      if (profileData.propertyDetails.hasAgriculturalLand) {
        profileData.propertyDetails.hasAgriculturalLand =
          profileData.propertyDetails.hasAgriculturalLand === "true" ||
          profileData.propertyDetails.hasAgriculturalLand === true;
      }
      if (profileData.propertyDetails.hasResidentialProperty) {
        profileData.propertyDetails.hasResidentialProperty =
          profileData.propertyDetails.hasResidentialProperty === "true" ||
          profileData.propertyDetails.hasResidentialProperty === true;
      }
      if (profileData.propertyDetails.hasCommercialProperty) {
        profileData.propertyDetails.hasCommercialProperty =
          profileData.propertyDetails.hasCommercialProperty === "true" ||
          profileData.propertyDetails.hasCommercialProperty === true;
      }
      if (profileData.propertyDetails.agriculturalLandAcres) {
        profileData.propertyDetails.agriculturalLandAcres =
          parseInt(profileData.propertyDetails.agriculturalLandAcres) || 0;
      }
    }

    if (
      profileData.partnerPreferences &&
      profileData.partnerPreferences.ageRange
    ) {
      if (profileData.partnerPreferences.ageRange.min) {
        profileData.partnerPreferences.ageRange.min =
          parseInt(profileData.partnerPreferences.ageRange.min) || 18;
      }
      if (profileData.partnerPreferences.ageRange.max) {
        profileData.partnerPreferences.ageRange.max =
          parseInt(profileData.partnerPreferences.ageRange.max) || 40;
      }
    }

    let profile = await Profile.findOne({ userId });

    if (profile) {
      Object.assign(profile, profileData);
      profile.updatedAt = new Date();
    } else {
      profile = new Profile({
        userId,
        ...profileData,
        isPublic: false,
      });
    }

    const completionPercentage = profile.calculateCompletion();
    profile.profileCompletionPercentage = completionPercentage;

    const hasPhotos = profile.photos && profile.photos.length > 0;
    const isCompleteEnough = completionPercentage >= 70;

    if (isCompleteEnough && hasPhotos) {
      profile.isPublic = true;
      profile.isProfileComplete = true;
      await User.findByIdAndUpdate(userId, {
        isProfileComplete: true,
        profileCompletionPercentage: completionPercentage,
      });
    } else {
      profile.isPublic = false;
      profile.isProfileComplete = false;
      await User.findByIdAndUpdate(userId, {
        isProfileComplete: false,
        profileCompletionPercentage: completionPercentage,
      });
    }

    await profile.save();

    res.status(200).json({
      message: "Profile saved successfully",
      profile,
      completionPercentage,
      isPublic: profile.isPublic,
      isProfileComplete: profile.isProfileComplete,
      requiresMoreInfo: completionPercentage < 70 || !hasPhotos,
    });
  } catch (error) {
    console.error("Profile save error:", error);
    res
      .status(500)
      .json({ message: "Failed to save profile", error: error.message });
  }
};

// Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const user = await User.findById(userId).select("-password");

    const completionPercentage = profile.calculateCompletion();
    profile.profileCompletionPercentage = completionPercentage;

    const hasPhotos = profile.photos && profile.photos.length > 0;
    if (completionPercentage >= 70 && hasPhotos) {
      profile.isPublic = true;
      profile.isProfileComplete = true;
    } else {
      profile.isPublic = false;
      profile.isProfileComplete = false;
    }

    await profile.save();

    res.status(200).json({
      profile,
      user,
      completionPercentage: profile.profileCompletionPercentage,
      isPublic: profile.isPublic,
      isProfileComplete: profile.isProfileComplete,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .json({ message: "Failed to get profile", error: error.message });
  }
};

// Get profile by ID
exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user.id;

    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (!profile.isPublic) {
      const viewer = await User.findById(viewerId);
      if (profile.userId.toString() !== viewerId && viewer.role !== "admin") {
        return res.status(403).json({ message: "Profile is not public" });
      }
    }

    const user = await User.findById(profile.userId).select("-password");

    profile.statistics.profileViews += 1;
    if (!profile.statistics.viewedBy.includes(viewerId)) {
      profile.statistics.viewedBy.push(viewerId);
    }
    await profile.save();

    res.status(200).json({
      profile,
      user,
      isOwner: profile.userId.toString() === viewerId,
    });
  } catch (error) {
    console.error("Get profile by ID error:", error);
    res
      .status(500)
      .json({ message: "Failed to get profile", error: error.message });
  }
};

// Get profile by ID OR User ID
exports.getProfileByIdOrUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user.id;

    let profile = await Profile.findById(id);

    if (!profile) {
      profile = await Profile.findOne({ userId: id });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (!profile.isPublic) {
      const viewer = await User.findById(viewerId);
      if (profile.userId.toString() !== viewerId && viewer.role !== "admin") {
        return res.status(403).json({ message: "Profile is not public" });
      }
    }

    const user = await User.findById(profile.userId).select("-password");

    profile.statistics.profileViews += 1;
    if (!profile.statistics.viewedBy.includes(viewerId)) {
      profile.statistics.viewedBy.push(viewerId);
    }
    await profile.save();

    res.status(200).json({
      profile,
      user,
      isOwner: profile.userId.toString() === viewerId,
    });
  } catch (error) {
    console.error("Get profile by ID/UserID error:", error);
    res
      .status(500)
      .json({ message: "Failed to get profile", error: error.message });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    let userId = req.user.id;
    if (req.body.userId && req.user.role === "admin") {
      userId = req.body.userId;
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    let profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: "shubha-mangalam/profiles",
        transformation: [
          { width: 400, height: 400, crop: "limit" },
          { quality: "auto" },
        ],
      });

      profile.profileImage = result.secure_url;
      await profile.save();

      res.status(200).json({
        message: "Profile image uploaded successfully",
        profileImage: result.secure_url,
      });
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      profile.profileImage = image;
      await profile.save();
      res.status(200).json({
        message: "Profile image saved",
        profileImage: image,
      });
    }
  } catch (error) {
    console.error("Upload profile image error:", error);
    res
      .status(500)
      .json({ message: "Failed to upload image", error: error.message });
  }
};

// Upload multiple photos - AUTO-CREATE PROFILE IF NOT EXISTS
exports.uploadPhotos = async (req, res) => {
  try {
    let userId = req.user.id;
    if (req.body.userId && req.user.role === "admin") {
      userId = req.body.userId;
    }

    const { photos } = req.body;

    console.log("📸 Upload photos request received for user:", userId);
    console.log("📸 Number of photos:", photos?.length || 0);

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No photos provided" });
    }

    let profile = await Profile.findOne({ userId });

    if (!profile) {
      console.log(
        "📸 Profile not found for user, creating new profile:",
        userId,
      );
      const user = await User.findById(userId);

      profile = new Profile({
        userId: userId,
        personalDetails: {
          fullName: user?.fullName || "",
          age: 0,
          dateOfBirth: new Date(),
          gender: "",
          religion: "",
          caste: "",
          motherTongue: "",
          education: "",
          occupation: "",
          annualIncome: 0,
          maritalStatus: "",
          height: 0,
          weight: 0,
          location: {
            state: "",
            city: "",
          },
          aboutMe: "",
        },
        familyDetails: {
          fatherName: "",
          motherName: "",
          brothers: 0,
          sisters: 0,
          familyBackground: "",
        },
        partnerPreferences: {
          ageRange: {
            min: 18,
            max: 40,
          },
          religion: "",
          caste: "",
          education: "",
          occupation: "",
        },
        propertyDetails: {},
        photos: [],
        isPublic: false,
        isProfileComplete: false,
      });

      await profile.save();
      console.log("✅ New profile created for user:", userId);
    }

    const uploadedPhotos = [];

    for (const photo of photos) {
      try {
        if (
          process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_CLOUD_NAME !== "your-cloud-name"
        ) {
          const result = await cloudinary.uploader.upload(photo, {
            folder: "shubha-mangalam/profiles",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto" },
            ],
          });
          uploadedPhotos.push({
            url: result.secure_url,
            publicId: result.public_id,
            isProfilePicture: false,
            isVerified: false,
          });
        } else {
          uploadedPhotos.push({
            url: photo,
            publicId: "local_" + Date.now(),
            isProfilePicture: false,
            isVerified: false,
          });
        }
      } catch (uploadError) {
        console.error("Photo upload error:", uploadError);
        uploadedPhotos.push({
          url: photo,
          publicId: "local_" + Date.now(),
          isProfilePicture: false,
          isVerified: false,
        });
      }
    }

    profile.photos.push(...uploadedPhotos);

    if (
      profile.photos.length > 0 &&
      !profile.photos.some((p) => p.isProfilePicture)
    ) {
      profile.photos[0].isProfilePicture = true;
    }

    const completionPercentage = profile.calculateCompletion();
    profile.profileCompletionPercentage = completionPercentage;

    const hasPhotos = profile.photos && profile.photos.length > 0;
    const isCompleteEnough = completionPercentage >= 70;

    if (isCompleteEnough && hasPhotos) {
      profile.isPublic = true;
      profile.isProfileComplete = true;
      await User.findByIdAndUpdate(userId, {
        isProfileComplete: true,
        profileCompletionPercentage: completionPercentage,
      });
    } else {
      profile.isPublic = false;
      profile.isProfileComplete = false;
      await User.findByIdAndUpdate(userId, {
        isProfileComplete: false,
        profileCompletionPercentage: completionPercentage,
      });
    }

    await profile.save();

    console.log("✅ Photos uploaded successfully:", uploadedPhotos.length);

    return res.status(200).json({
      success: true,
      message: "Photos uploaded successfully",
      photos: profile.photos,
      completionPercentage,
      isPublic: profile.isPublic,
      isProfileComplete: profile.isProfileComplete,
    });
  } catch (error) {
    console.error("Upload photos error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload photos",
      error: error.message,
    });
  }
};

// Set profile picture
exports.setProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.body;

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const photoIndex = profile.photos.findIndex(
      (p) => p._id.toString() === photoId,
    );
    if (photoIndex === -1) {
      return res.status(404).json({ message: "Photo not found" });
    }

    profile.photos.forEach((p) => (p.isProfilePicture = false));
    profile.photos[photoIndex].isProfilePicture = true;

    await profile.save();

    res.status(200).json({
      message: "Profile picture updated successfully",
      photos: profile.photos,
    });
  } catch (error) {
    console.error("Set profile picture error:", error);
    res
      .status(500)
      .json({ message: "Failed to set profile picture", error: error.message });
  }
};

// Delete photo
exports.deletePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const photoIndex = profile.photos.findIndex(
      (p) => p._id.toString() === photoId,
    );
    if (photoIndex === -1) {
      return res.status(404).json({ message: "Photo not found" });
    }

    const photo = profile.photos[photoIndex];

    if (photo.publicId) {
      try {
        await cloudinary.uploader.destroy(photo.publicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError);
      }
    }

    profile.photos.splice(photoIndex, 1);

    if (photo.isProfilePicture && profile.photos.length > 0) {
      profile.photos[0].isProfilePicture = true;
    }

    const completionPercentage = profile.calculateCompletion();
    profile.profileCompletionPercentage = completionPercentage;

    if (completionPercentage >= 70 && profile.photos.length > 0) {
      profile.isPublic = true;
      await User.findByIdAndUpdate(userId, {
        isProfileComplete: true,
        profileCompletionPercentage: completionPercentage,
      });
    } else {
      profile.isPublic = false;
      await User.findByIdAndUpdate(userId, {
        isProfileComplete: false,
        profileCompletionPercentage: completionPercentage,
      });
    }

    await profile.save();

    res.status(200).json({
      message: "Photo deleted successfully",
      photos: profile.photos,
      completionPercentage,
      isPublic: profile.isPublic,
    });
  } catch (error) {
    console.error("Delete photo error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete photo", error: error.message });
  }
};

// Save profile to favorites
exports.saveProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({ message: "Profile ID is required" });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const index = profile.statistics.savedBy.indexOf(userId);
    if (index > -1) {
      profile.statistics.savedBy.splice(index, 1);
      await profile.save();
      return res.status(200).json({
        message: "Profile removed from favorites",
        saved: false,
      });
    } else {
      profile.statistics.savedBy.push(userId);
      await profile.save();
      return res.status(200).json({
        message: "Profile saved to favorites",
        saved: true,
      });
    }
  } catch (error) {
    console.error("Save profile error:", error);
    res
      .status(500)
      .json({ message: "Failed to save profile", error: error.message });
  }
};

// Get saved profiles
exports.getSavedProfiles = async (req, res) => {
  try {
    const userId = req.user.id;

    const profiles = await Profile.find({
      "statistics.savedBy": userId,
      isPublic: true,
    }).populate("userId", "fullName mobileNumber");

    res.status(200).json({
      profiles,
      count: profiles.length,
    });
  } catch (error) {
    console.error("Get saved profiles error:", error);
    res
      .status(500)
      .json({ message: "Failed to get saved profiles", error: error.message });
  }
};

// Delete own profile
exports.deleteOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (profile.photos && profile.photos.length > 0) {
      for (const photo of profile.photos) {
        if (photo.publicId && photo.publicId.startsWith("shubha-mangalam/")) {
          try {
            await cloudinary.uploader.destroy(photo.publicId);
          } catch (cloudinaryError) {
            console.error("Cloudinary delete error:", cloudinaryError);
          }
        }
      }
    }

    if (profile.profileImage) {
      try {
        const publicId = profile.profileImage.split("/").pop().split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(
            `shubha-mangalam/profiles/${publicId}`,
          );
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError);
      }
    }

    await Profile.findOneAndDelete({ userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Profile and account deleted successfully",
    });
  } catch (error) {
    console.error("Delete own profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile",
      error: error.message,
    });
  }
};

// Admin delete profile
exports.adminDeleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    await Profile.findByIdAndDelete(id);
    await User.findByIdAndUpdate(profile.userId, {
      isProfileComplete: false,
      profileCompletionPercentage: 0,
    });

    res.status(200).json({
      message: "Profile deleted successfully. User account remains active.",
    });
  } catch (error) {
    console.error("Admin delete profile error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete profile", error: error.message });
  }
};

// Track profile view
exports.trackProfileView = async (req, res) => {
  try {
    const { profileId } = req.params;
    const viewerId = req.user.id;

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    if (profile.userId.toString() === viewerId) {
      return res.status(200).json({
        success: true,
        message: "Own profile view not counted",
        viewCount: profile.statistics?.profileViews || 0,
      });
    }

    const lastViewIndex = profile.statistics?.viewedBy?.indexOf(viewerId);
    if (lastViewIndex !== -1 && lastViewIndex !== undefined) {
      return res.status(200).json({
        success: true,
        message: "Already viewed recently",
        viewCount: profile.statistics?.profileViews || 0,
      });
    }

    if (!profile.statistics) {
      profile.statistics = {};
    }
    if (!profile.statistics.profileViews) {
      profile.statistics.profileViews = 0;
    }
    if (!profile.statistics.viewedBy) {
      profile.statistics.viewedBy = [];
    }

    profile.statistics.profileViews += 1;
    profile.statistics.viewedBy.push(viewerId);

    await profile.save();

    res.status(200).json({
      success: true,
      message: "View tracked successfully",
      viewCount: profile.statistics.profileViews,
    });
  } catch (error) {
    console.error("Track profile view error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track view",
      error: error.message,
    });
  }
};
