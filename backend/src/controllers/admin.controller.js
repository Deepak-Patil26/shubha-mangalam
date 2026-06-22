const User = require("../models/User.model");
const Profile = require("../models/Profile.model");
const Interest = require("../models/Interest.model");
const Callback = require("../models/Callback.model");
const Complaint = require("../models/Complaint.model");
const SuccessStory = require("../models/SuccessStory.model");
const mongoose = require("mongoose");

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProfiles,
      activeUsers,
      profileCompletionStats,
      interestStats,
      callbackStats,
      complaintStats,
      successStoryStats,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Profile.countDocuments({}),
      User.countDocuments({ isActive: true, role: "user" }),
      Profile.aggregate([
        {
          $group: {
            _id: null,
            averageCompletion: { $avg: "$profileCompletionPercentage" },
            completeProfiles: {
              $sum: {
                $cond: [{ $gte: ["$profileCompletionPercentage", 70] }, 1, 0],
              },
            },
            incompleteProfiles: {
              $sum: {
                $cond: [{ $lt: ["$profileCompletionPercentage", 70] }, 1, 0],
              },
            },
          },
        },
      ]),
      Interest.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Callback.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Complaint.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      SuccessStory.countDocuments({ approved: true }),
    ]);

    // Format interest stats
    const interestCounts = {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0,
    };
    interestStats.forEach((stat) => {
      interestCounts[stat._id] = stat.count;
      interestCounts.total += stat.count;
    });

    // Format callback stats
    const callbackCounts = {
      total: 0,
      pending: 0,
      contacted: 0,
      resolved: 0,
      cancelled: 0,
    };
    callbackStats.forEach((stat) => {
      callbackCounts[stat._id] = stat.count;
      callbackCounts.total += stat.count;
    });

    // Format complaint stats
    const complaintCounts = {
      total: 0,
      pending: 0,
      investigating: 0,
      resolved: 0,
      dismissed: 0,
    };
    complaintStats.forEach((stat) => {
      complaintCounts[stat._id] = stat.count;
      complaintCounts.total += stat.count;
    });

    res.status(200).json({
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      profiles: {
        total: totalProfiles,
        ...(profileCompletionStats[0] || {
          averageCompletion: 0,
          completeProfiles: 0,
          incompleteProfiles: 0,
        }),
      },
      interests: interestCounts,
      callbacks: callbackCounts,
      complaints: complaintCounts,
      successStories: successStoryStats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res
      .status(500)
      .json({ message: "Failed to get stats", error: error.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const {
      search,
      role,
      status,
      profileType,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status === "active") {
      query.isActive = true;
      query.isSuspended = false;
    } else if (status === "inactive") {
      query.isActive = false;
    } else if (status === "suspended") {
      query.isSuspended = true;
    }

    if (profileType) {
      query.profileType = profileType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    // Get profile info for each user
    const userIds = users.map((u) => u._id);
    const profiles = await Profile.find({ userId: { $in: userIds } }).select(
      "userId profileCompletionPercentage isPublic profileImage",
    );

    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    const usersWithProfile = users.map((user) => {
      const profile = profileMap[user._id.toString()];
      return {
        ...user,
        profileCompletion: profile ? profile.profileCompletionPercentage : 0,
        hasProfile: !!profile,
        isProfilePublic: profile ? profile.isPublic : false,
        profileImage: profile ? profile.profileImage : null,
      };
    });

    res.status(200).json({
      users: usersWithProfile,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res
      .status(500)
      .json({ message: "Failed to get users", error: error.message });
  }
};

// Get user details (admin only)
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await Profile.findOne({ userId: id });

    // Get statistics
    const [interestsSent, interestsReceived, callbacks, complaints] =
      await Promise.all([
        Interest.countDocuments({ senderId: id }),
        Interest.countDocuments({ receiverId: id }),
        Callback.countDocuments({ userId: id }),
        Complaint.countDocuments({ reporterId: id }),
      ]);

    res.status(200).json({
      user,
      profile: profile || null,
      statistics: {
        interestsSent,
        interestsReceived,
        callbacks,
        complaints,
      },
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res
      .status(500)
      .json({ message: "Failed to get user details", error: error.message });
  }
};

// Suspend user
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isSuspended = true;
    user.isActive = false;
    await user.save();

    // Hide profile
    await Profile.findOneAndUpdate({ userId: id }, { isPublic: false });

    res.status(200).json({
      message: "User suspended successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        isSuspended: user.isSuspended,
      },
    });
  } catch (error) {
    console.error("Suspend user error:", error);
    res
      .status(500)
      .json({ message: "Failed to suspend user", error: error.message });
  }
};

// Unsuspend user
exports.unsuspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isSuspended = false;
    user.isActive = true;
    await user.save();

    // Make profile public if complete
    const profile = await Profile.findOne({ userId: id });
    if (
      profile &&
      profile.profileCompletionPercentage >= 70 &&
      profile.photos.length > 0
    ) {
      profile.isPublic = true;
      await profile.save();
    }

    res.status(200).json({
      message: "User unsuspended successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        isSuspended: user.isSuspended,
      },
    });
  } catch (error) {
    console.error("Unsuspend user error:", error);
    res
      .status(500)
      .json({ message: "Failed to unsuspend user", error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete profile
    await Profile.findOneAndDelete({ userId: id });

    // Delete user
    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

// Delete any profile (admin only)
exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const userId = profile.userId;

    await Profile.findByIdAndDelete(id);
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "Profile and associated user account deleted successfully",
    });
  } catch (error) {
    console.error("Delete profile error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete profile", error: error.message });
  }
};

// Create profile for offline client (admin only) - NO VALIDATION
exports.createBrokerProfile = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      password,
      personalDetails,
      familyDetails,
      partnerPreferences,
      propertyDetails,
    } = req.body;

    let user = await User.findOne({ mobileNumber });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists with this mobile number" });
    }

    user = new User({
      fullName: fullName || "User",
      mobileNumber,
      password: password || "Broker@123",
      role: "user",
      profileType: "broker_added",
      isActive: true,
      isProfileComplete: true,
    });

    await user.save();

    const profile = new Profile({
      userId: user._id,
      personalDetails: {
        fullName: fullName || "",
        age: parseInt(personalDetails?.age) || 0,
        dateOfBirth: personalDetails?.dateOfBirth || new Date(),
        gender: personalDetails?.gender || "",
        religion: personalDetails?.religion || "",
        caste: personalDetails?.caste || "",
        motherTongue: personalDetails?.motherTongue || "",
        education: personalDetails?.education || "",
        occupation: personalDetails?.occupation || "",
        annualIncome: parseInt(personalDetails?.annualIncome) || 0,
        maritalStatus: personalDetails?.maritalStatus || "",
        height: parseInt(personalDetails?.height) || 0,
        weight: parseInt(personalDetails?.weight) || 0,
        location: {
          state: personalDetails?.location?.state || "",
          city: personalDetails?.location?.city || "",
        },
        aboutMe: personalDetails?.aboutMe || "",
      },
      familyDetails: {
        fatherName: familyDetails?.fatherName || "",
        motherName: familyDetails?.motherName || "",
        brothers: parseInt(familyDetails?.brothers) || 0,
        sisters: parseInt(familyDetails?.sisters) || 0,
        familyBackground: familyDetails?.familyBackground || "",
      },
      partnerPreferences: {
        ageRange: {
          min: parseInt(partnerPreferences?.ageRange?.min) || 18,
          max: parseInt(partnerPreferences?.ageRange?.max) || 40,
        },
        religion: partnerPreferences?.religion || "",
        caste: partnerPreferences?.caste || "",
        education: partnerPreferences?.education || "",
        occupation: partnerPreferences?.occupation || "",
      },
      propertyDetails: propertyDetails || {},
      photos: [],
      isPublic: true,
      isVerified: true,
    });

    const completionPercentage = profile.calculateCompletion();
    profile.profileCompletionPercentage = completionPercentage;

    await profile.save();

    await User.findByIdAndUpdate(user._id, {
      isProfileComplete: true,
      profileCompletionPercentage: completionPercentage,
    });

    res.status(201).json({
      message: "Profile created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        profileType: user.profileType,
      },
      profile,
    });
  } catch (error) {
    console.error("Create broker profile error:", error);
    res
      .status(500)
      .json({ message: "Failed to create profile", error: error.message });
  }
};

// Get all callbacks
exports.getAllCallbacks = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [callbacks, total] = await Promise.all([
      Callback.find(query)
        .populate("userId", "fullName mobileNumber")
        .populate("profileId", "personalDetails.fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Callback.countDocuments(query),
    ]);

    res.status(200).json({
      callbacks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all callbacks error:", error);
    res
      .status(500)
      .json({ message: "Failed to get callbacks", error: error.message });
  }
};

// Update callback status
exports.updateCallbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const callback = await Callback.findById(id);
    if (!callback) {
      return res.status(404).json({ message: "Callback not found" });
    }

    callback.status = status;
    callback.notes = notes || callback.notes;

    if (status === "contacted") {
      callback.contactedAt = new Date();
    } else if (status === "resolved") {
      callback.resolvedAt = new Date();
    }

    await callback.save();

    res.status(200).json({
      message: "Callback updated successfully",
      callback,
    });
  } catch (error) {
    console.error("Update callback error:", error);
    res
      .status(500)
      .json({ message: "Failed to update callback", error: error.message });
  }
};

// Get all complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate("reporterId", "fullName mobileNumber")
        .populate("targetUserId", "fullName mobileNumber")
        .populate("targetProfileId", "personalDetails.fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(query),
    ]);

    res.status(200).json({
      complaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all complaints error:", error);
    res
      .status(500)
      .json({ message: "Failed to get complaints", error: error.message });
  }
};

// Update complaint status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, resolution } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    complaint.adminNotes = adminNotes || complaint.adminNotes;

    if (status === "resolved") {
      complaint.resolution = resolution || "Resolved";
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error) {
    console.error("Update complaint error:", error);
    res
      .status(500)
      .json({ message: "Failed to update complaint", error: error.message });
  }
};

// Manage success stories - Create
exports.createSuccessStory = async (req, res) => {
  try {
    const {
      coupleName,
      brideName,
      groomName,
      photos,
      story,
      testimonial,
      weddingDate,
      location,
    } = req.body;

    const successStory = new SuccessStory({
      coupleName,
      brideName,
      groomName,
      photos: photos || [],
      story,
      testimonial: testimonial || "",
      weddingDate: new Date(weddingDate),
      location: location || "",
      approved: false,
      featured: false,
    });

    await successStory.save();

    res.status(201).json({
      message: "Success story created successfully",
      successStory,
    });
  } catch (error) {
    console.error("Create success story error:", error);
    res.status(500).json({
      message: "Failed to create success story",
      error: error.message,
    });
  }
};

// Get all success stories (admin)
exports.getAllSuccessStories = async (req, res) => {
  try {
    const { approved, featured, page = 1, limit = 20 } = req.query;

    const query = {};
    if (approved !== undefined) {
      query.approved = approved === "true";
    }
    if (featured !== undefined) {
      query.featured = featured === "true";
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [stories, total] = await Promise.all([
      SuccessStory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SuccessStory.countDocuments(query),
    ]);

    res.status(200).json({
      stories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get success stories error:", error);
    res
      .status(500)
      .json({ message: "Failed to get success stories", error: error.message });
  }
};

// Approve success story
exports.approveSuccessStory = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await SuccessStory.findById(id);
    if (!story) {
      return res.status(404).json({ message: "Success story not found" });
    }

    story.approved = true;
    await story.save();

    res.status(200).json({
      message: "Success story approved",
      story,
    });
  } catch (error) {
    console.error("Approve success story error:", error);
    res
      .status(500)
      .json({ message: "Failed to approve story", error: error.message });
  }
};

// Delete success story
exports.deleteSuccessStory = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await SuccessStory.findById(id);
    if (!story) {
      return res.status(404).json({ message: "Success story not found" });
    }

    await story.deleteOne();

    res.status(200).json({
      message: "Success story deleted",
    });
  } catch (error) {
    console.error("Delete success story error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete story", error: error.message });
  }
};

// ============================================================
// TESTIMONIALS MANAGEMENT
// ============================================================

// Get all testimonials (admin)
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await SuccessStory.find({
      approved: true,
      testimonial: { $ne: "" },
    })
      .sort({ createdAt: -1 })
      .select(
        "coupleName brideName groomName story testimonial weddingDate location photos approved featured createdAt",
      );

    res.status(200).json({
      success: true,
      testimonials,
    });
  } catch (error) {
    console.error("Get testimonials error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get testimonials",
    });
  }
};

// Create testimonial (admin)
exports.createTestimonial = async (req, res) => {
  try {
    const {
      coupleName,
      brideName,
      groomName,
      story,
      testimonial,
      weddingDate,
      location,
      photos,
    } = req.body;

    const newTestimonial = new SuccessStory({
      coupleName,
      brideName,
      groomName,
      story: story || "A beautiful love story",
      testimonial:
        testimonial || "Shubha Mangalam helped us find our perfect match.",
      weddingDate: weddingDate || new Date(),
      location: location || "",
      photos: photos || [],
      approved: true,
      featured: false,
    });

    await newTestimonial.save();

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      testimonial: newTestimonial,
    });
  } catch (error) {
    console.error("Create testimonial error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create testimonial",
    });
  }
};

// Update testimonial (admin)
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const testimonial = await SuccessStory.findById(id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    Object.assign(testimonial, updates);
    await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      testimonial,
    });
  } catch (error) {
    console.error("Update testimonial error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update testimonial",
    });
  }
};

// Delete testimonial (admin)
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await SuccessStory.findById(id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await testimonial.deleteOne();

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete testimonial",
    });
  }
};

// ============================================================
// INTEREST MANAGEMENT (ADMIN)
// ============================================================

// Get all interests (admin)
exports.getAllInterests = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [interests, total] = await Promise.all([
      Interest.find(query)
        .populate("senderId", "fullName mobileNumber")
        .populate("receiverId", "fullName mobileNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Interest.countDocuments(query),
    ]);

    res.status(200).json({
      interests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all interests error:", error);
    res
      .status(500)
      .json({ message: "Failed to get interests", error: error.message });
  }
};

// Update interest status (admin)
exports.updateInterestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const interest = await Interest.findById(id);
    if (!interest) {
      return res.status(404).json({ message: "Interest not found" });
    }

    interest.status = status;
    interest.respondedAt = new Date();

    if (status === "accepted") {
      interest.brokerNotified = true;
      interest.notifiedAt = new Date();

      await Profile.findOneAndUpdate(
        { userId: interest.senderId },
        { $inc: { "statistics.matches": 1 } },
      );
      await Profile.findOneAndUpdate(
        { userId: interest.receiverId },
        { $inc: { "statistics.matches": 1 } },
      );
    }

    await interest.save();

    res.status(200).json({
      message: `Interest ${status} successfully`,
      interest,
    });
  } catch (error) {
    console.error("Update interest status error:", error);
    res
      .status(500)
      .json({ message: "Failed to update interest", error: error.message });
  }
};

// Update success story (admin)
exports.updateSuccessStory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const story = await SuccessStory.findById(id);
    if (!story) {
      return res.status(404).json({ message: "Success story not found" });
    }

    // Update fields
    Object.assign(story, updateData);
    story.updatedAt = new Date();

    await story.save();

    res.status(200).json({
      message: "Success story updated successfully",
      story,
    });
  } catch (error) {
    console.error("Update success story error:", error);
    res
      .status(500)
      .json({ message: "Failed to update story", error: error.message });
  }
};

// ============================================================
// ADMIN PROFILE MANAGEMENT - NEW FUNCTIONS
// ============================================================

// Get all profiles for admin (with user details)
exports.getAllAdminProfiles = async (req, res) => {
  try {
    const { search, profileType, page = 1, limit = 50 } = req.query;

    const query = {};
    if (profileType) {
      query.profileType = profileType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [profiles, total] = await Promise.all([
      Profile.find(query)
        .populate("userId", "fullName mobileNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Profile.countDocuments(query),
    ]);

    // Format profiles with user data
    const formattedProfiles = profiles.map((profile) => {
      const user = profile.userId || {};
      return {
        ...profile,
        userId: user,
        profileType: user.profileType || "self_registered",
      };
    });

    res.status(200).json({
      success: true,
      profiles: formattedProfiles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all admin profiles error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profiles",
      error: error.message,
    });
  }
};

// Get single profile for admin (with user details)
exports.getAdminProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id)
      .populate("userId", "-password")
      .lean();
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
      user: profile.userId || null,
    });
  } catch (error) {
    console.error("Get admin profile by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

// Update profile (admin)
exports.updateAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      mobileNumber,
      personalDetails,
      familyDetails,
      partnerPreferences,
      propertyDetails,
    } = req.body;

    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Update user if mobile number changed
    if (mobileNumber) {
      const user = await User.findById(profile.userId);
      if (user) {
        user.fullName = fullName || user.fullName;
        user.mobileNumber = mobileNumber;
        await user.save();
      }
    }

    // Update profile - all fields optional
    if (personalDetails) {
      profile.personalDetails = {
        fullName: fullName || personalDetails.fullName || "",
        age: parseInt(personalDetails.age) || 0,
        dateOfBirth: personalDetails.dateOfBirth || new Date(),
        gender: personalDetails.gender || "",
        religion: personalDetails.religion || "",
        caste: personalDetails.caste || "",
        motherTongue: personalDetails.motherTongue || "",
        education: personalDetails.education || "",
        occupation: personalDetails.occupation || "",
        annualIncome: parseInt(personalDetails.annualIncome) || 0,
        maritalStatus: personalDetails.maritalStatus || "",
        height: parseInt(personalDetails.height) || 0,
        weight: parseInt(personalDetails.weight) || 0,
        location: {
          state: personalDetails.location?.state || "",
          city: personalDetails.location?.city || "",
        },
        aboutMe: personalDetails.aboutMe || "",
      };
    }

    if (familyDetails) {
      profile.familyDetails = {
        fatherName: familyDetails.fatherName || "",
        motherName: familyDetails.motherName || "",
        brothers: parseInt(familyDetails.brothers) || 0,
        sisters: parseInt(familyDetails.sisters) || 0,
        familyBackground: familyDetails.familyBackground || "",
      };
    }

    if (partnerPreferences) {
      profile.partnerPreferences = {
        ageRange: {
          min: parseInt(partnerPreferences.ageRange?.min) || 18,
          max: parseInt(partnerPreferences.ageRange?.max) || 40,
        },
        religion: partnerPreferences.religion || "",
        caste: partnerPreferences.caste || "",
        education: partnerPreferences.education || "",
        occupation: partnerPreferences.occupation || "",
      };
    }

    if (propertyDetails) {
      profile.propertyDetails = {
        hasAgriculturalLand: propertyDetails.hasAgriculturalLand || false,
        agriculturalLandAcres:
          parseInt(propertyDetails.agriculturalLandAcres) || 0,
        hasResidentialProperty: propertyDetails.hasResidentialProperty || false,
        residentialPropertyDetails:
          propertyDetails.residentialPropertyDetails || "",
        hasCommercialProperty: propertyDetails.hasCommercialProperty || false,
        commercialPropertyDetails:
          propertyDetails.commercialPropertyDetails || "",
        otherAssets: propertyDetails.otherAssets || "",
        propertyDescription: propertyDetails.propertyDescription || "",
      };
    }

    // Recalculate completion
    const completionPercentage = profile.calculateCompletion();
    profile.profileCompletionPercentage = completionPercentage;

    const hasPhotos = profile.photos && profile.photos.length > 0;
    if (completionPercentage >= 70 && hasPhotos) {
      profile.isPublic = true;
      profile.isProfileComplete = true;
      await User.findByIdAndUpdate(profile.userId, {
        isProfileComplete: true,
        profileCompletionPercentage: completionPercentage,
      });
    } else {
      profile.isPublic = false;
      profile.isProfileComplete = false;
      await User.findByIdAndUpdate(profile.userId, {
        isProfileComplete: false,
        profileCompletionPercentage: completionPercentage,
      });
    }

    profile.updatedAt = new Date();
    await profile.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// ==================== MODULE EXPORTS ====================
module.exports = {
  // Dashboard & Users
  getDashboardStats: exports.getDashboardStats,
  getAllUsers: exports.getAllUsers,
  getUserDetails: exports.getUserDetails,
  suspendUser: exports.suspendUser,
  unsuspendUser: exports.unsuspendUser,
  deleteUser: exports.deleteUser,
  deleteProfile: exports.deleteProfile,
  createBrokerProfile: exports.createBrokerProfile,

  // Admin Profile Management - NEW
  getAllAdminProfiles: exports.getAllAdminProfiles,
  getAdminProfileById: exports.getAdminProfileById,
  updateAdminProfile: exports.updateAdminProfile,

  // Callbacks
  getAllCallbacks: exports.getAllCallbacks,
  updateCallbackStatus: exports.updateCallbackStatus,

  // Complaints
  getAllComplaints: exports.getAllComplaints,
  updateComplaintStatus: exports.updateComplaintStatus,

  // Success Stories
  createSuccessStory: exports.createSuccessStory,
  getAllSuccessStories: exports.getAllSuccessStories,
  approveSuccessStory: exports.approveSuccessStory,
  deleteSuccessStory: exports.deleteSuccessStory,
  updateSuccessStory: exports.updateSuccessStory,

  // Testimonials
  getAllTestimonials: exports.getAllTestimonials,
  createTestimonial: exports.createTestimonial,
  updateTestimonial: exports.updateTestimonial,
  deleteTestimonial: exports.deleteTestimonial,

  // Interests
  getAllInterests: exports.getAllInterests,
  updateInterestStatus: exports.updateInterestStatus,
};
