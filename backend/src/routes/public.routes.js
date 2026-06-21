// const express = require("express");
// const router = express.Router();
// const SuccessStory = require("../models/SuccessStory.model");
// const Profile = require("../models/Profile.model");
// const User = require("../models/User.model");
// const Interest = require("../models/Interest.model");

// // Get public success stories (no auth required) - FOR PUBLIC
// router.get("/success-stories", async (req, res) => {
//   try {
//     const stories = await SuccessStory.find({ approved: true })
//       .sort({ createdAt: -1 })
//       .limit(10);

//     res.status(200).json({
//       success: true,
//       stories,
//       count: stories.length,
//     });
//   } catch (error) {
//     console.error("Public success stories error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch stories",
//     });
//   }
// });

// // Get ALL success stories (for admin) - NO LIMIT
// router.get("/admin/success-stories", async (req, res) => {
//   try {
//     const stories = await SuccessStory.find({}).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       stories,
//       count: stories.length,
//     });
//   } catch (error) {
//     console.error("Admin success stories error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch stories",
//     });
//   }
// });

// // Get public stats (no auth required)
// router.get("/stats", async (req, res) => {
//   try {
//     const totalProfiles = await Profile.countDocuments({ isPublic: true });
//     const totalUsers = await User.countDocuments({ role: "user" });
//     const totalInterests = await Interest.countDocuments();
//     const successStories = await SuccessStory.countDocuments({
//       approved: true,
//     });

//     res.status(200).json({
//       success: true,
//       totalUsers,
//       totalProfiles,
//       totalInterests,
//       successStories,
//     });
//   } catch (error) {
//     console.error("Public stats error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch stats",
//     });
//   }
// });

// // Get featured success story
// router.get("/featured-story", async (req, res) => {
//   try {
//     const story = await SuccessStory.findOne({
//       approved: true,
//       featured: true,
//     }).sort({ createdAt: -1 });

//     if (!story) {
//       const latestStory = await SuccessStory.findOne({ approved: true }).sort({
//         createdAt: -1,
//       });
//       return res.status(200).json({
//         success: true,
//         story: latestStory || null,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       story,
//     });
//   } catch (error) {
//     console.error("Featured story error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch featured story",
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const SuccessStory = require("../models/SuccessStory.model");
const Profile = require("../models/Profile.model");
const User = require("../models/User.model");
const Interest = require("../models/Interest.model");

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// GET public profiles (for home page carousel)
router.get("/profiles", async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const profiles = await Profile.find({
      isPublic: true,
      isProfileComplete: true,
    })
      .select("personalDetails profileImage photos userId")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Get user details for each profile
    const userIds = profiles.map((p) => p.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select("fullName mobileNumber")
      .lean();

    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    // Format profiles for public view
    const formattedProfiles = profiles.map((profile) => {
      const user = userMap[profile.userId.toString()];
      return {
        _id: profile._id,
        personalDetails: {
          fullName:
            profile.personalDetails?.fullName || user?.fullName || "Unknown",
          age: profile.personalDetails?.age || 0,
          gender: profile.personalDetails?.gender || "",
          religion: profile.personalDetails?.religion || "",
          education: profile.personalDetails?.education || "",
          occupation: profile.personalDetails?.occupation || "",
          motherTongue: profile.personalDetails?.motherTongue || "",
          location: {
            city: profile.personalDetails?.location?.city || "",
            state: profile.personalDetails?.location?.state || "",
          },
        },
        profileImage: profile.profileImage || null,
        photos: profile.photos || [],
        userId: profile.userId,
      };
    });

    res.status(200).json({
      success: true,
      profiles: formattedProfiles,
      count: formattedProfiles.length,
    });
  } catch (error) {
    console.error("Error fetching public profiles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profiles",
      error: error.message,
    });
  }
});

// Get public success stories (no auth required)
router.get("/success-stories", async (req, res) => {
  try {
    const stories = await SuccessStory.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stories,
      count: stories.length,
    });
  } catch (error) {
    console.error("Public success stories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stories",
    });
  }
});

// Get ALL success stories (for admin) - NO LIMIT
router.get("/admin/success-stories", async (req, res) => {
  try {
    const stories = await SuccessStory.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      stories,
      count: stories.length,
    });
  } catch (error) {
    console.error("Admin success stories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stories",
    });
  }
});

// Get public stats (no auth required)
router.get("/stats", async (req, res) => {
  try {
    const totalProfiles = await Profile.countDocuments({
      isPublic: true,
      isProfileComplete: true,
    });
    const totalUsers = await User.countDocuments({
      role: "user",
      isActive: true,
    });
    const totalInterests = await Interest.countDocuments({
      status: "accepted",
    });
    const successStories = await SuccessStory.countDocuments({
      approved: true,
    });

    res.status(200).json({
      success: true,
      totalUsers,
      totalProfiles,
      totalInterests,
      successStories,
    });
  } catch (error) {
    console.error("Public stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
    });
  }
});

// Get featured success story
router.get("/featured-story", async (req, res) => {
  try {
    const story = await SuccessStory.findOne({
      approved: true,
      featured: true,
    }).sort({ createdAt: -1 });

    if (!story) {
      const latestStory = await SuccessStory.findOne({ approved: true }).sort({
        createdAt: -1,
      });
      return res.status(200).json({
        success: true,
        story: latestStory || null,
      });
    }

    res.status(200).json({
      success: true,
      story,
    });
  } catch (error) {
    console.error("Featured story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured story",
    });
  }
});

module.exports = router;
