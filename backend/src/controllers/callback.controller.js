const Callback = require("../models/Callback.model");
const Profile = require("../models/Profile.model");

// Request callback
exports.requestCallback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileId, name, phoneNumber, message } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Name and phone number are required",
      });
    }

    // Check if profile exists
    if (profileId) {
      const profile = await Profile.findById(profileId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }
    }

    // Create callback request
    const callback = new Callback({
      userId,
      profileId: profileId || null,
      name,
      phoneNumber,
      message: message || "Callback requested",
      status: "pending",
    });

    await callback.save();

    console.log(
      `📞 Callback request created - User: ${userId}, Profile: ${profileId || "N/A"}`,
    );

    res.status(201).json({
      success: true,
      message: "Callback request sent successfully",
      callback,
    });
  } catch (error) {
    console.error("Callback request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request callback",
      error: error.message,
    });
  }
};

// Get user's callbacks
exports.getMyCallbacks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const callbacks = await Callback.find(query)
      .populate("profileId", "personalDetails.fullName personalDetails.age")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      callbacks,
    });
  } catch (error) {
    console.error("Get my callbacks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get callbacks",
      error: error.message,
    });
  }
};
