const Interest = require("../models/Interest.model");
const Profile = require("../models/Profile.model");
const User = require("../models/User.model");
const Callback = require("../models/Callback.model");

// Send interest
exports.sendInterest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const {
      receiverId,
      message,
      requestCallback,
      callbackName,
      callbackPhone,
    } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Check if receiver is active
    if (!receiver.isActive || receiver.isSuspended) {
      return res
        .status(400)
        .json({ message: "Cannot send interest to this user" });
    }

    // Check if receiver's profile is public
    const receiverProfile = await Profile.findOne({ userId: receiverId });
    if (!receiverProfile || !receiverProfile.isPublic) {
      return res
        .status(400)
        .json({ message: "Cannot send interest to this profile" });
    }

    // Check if interest already exists
    const existingInterest = await Interest.findOne({
      senderId,
      receiverId,
    });

    if (existingInterest) {
      return res
        .status(400)
        .json({ message: "Interest already sent to this user" });
    }

    // Create interest
    const interest = new Interest({
      senderId,
      receiverId,
      message: message || "",
      status: "pending",
    });

    // Handle callback request
    if (requestCallback && callbackName && callbackPhone) {
      interest.callbackRequested = true;
      interest.callbackDetails = {
        name: callbackName,
        phoneNumber: callbackPhone,
        requestedAt: new Date(),
        status: "pending",
      };
    }

    await interest.save();

    // Update statistics
    await Profile.findOneAndUpdate(
      { userId: senderId },
      { $inc: { "statistics.interestSent": 1 } },
    );
    await Profile.findOneAndUpdate(
      { userId: receiverId },
      { $inc: { "statistics.interestReceived": 1 } },
    );

    // Create callback request if requested
    if (requestCallback && callbackName && callbackPhone) {
      const callback = new Callback({
        userId: senderId,
        profileId: receiverProfile._id,
        name: callbackName,
        phoneNumber: callbackPhone,
        message: `Callback requested after sending interest to profile ${receiverProfile._id}`,
        status: "pending",
      });
      await callback.save();
    }

    console.log(`🔔 Interest sent: ${senderId} -> ${receiverId}`);

    res.status(201).json({
      message: "Interest sent successfully",
      interest,
      requiresBroker: true,
      brokerContact: {
        phone: "+919110480411",
        whatsapp: "+918123427060",
      },
    });
  } catch (error) {
    console.error("Send interest error:", error);
    res
      .status(500)
      .json({ message: "Failed to send interest", error: error.message });
  }
};

// Accept interest - FIXED
exports.acceptInterest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interestId } = req.params;

    console.log(
      `📥 Accept interest request - User: ${userId}, Interest: ${interestId}`,
    );

    const interest = await Interest.findById(interestId);
    if (!interest) {
      console.log("❌ Interest not found");
      return res.status(404).json({ message: "Interest not found" });
    }

    console.log(
      `📋 Interest found - Sender: ${interest.senderId}, Receiver: ${interest.receiverId}`,
    );

    // Check if user is the receiver (the person who received the interest)
    const receiverIdStr = interest.receiverId.toString();
    const userIdStr = userId.toString();

    console.log(
      `🔍 Comparing - User: ${userIdStr}, Receiver: ${receiverIdStr}`,
    );

    if (receiverIdStr !== userIdStr) {
      console.log("❌ Not authorized - User is not the receiver");
      return res
        .status(403)
        .json({ message: "Not authorized to accept this interest" });
    }

    // Check if interest is pending
    if (interest.status !== "pending") {
      console.log(`❌ Interest status is not pending: ${interest.status}`);
      return res.status(400).json({ message: "Interest is not pending" });
    }

    // Update interest
    interest.status = "accepted";
    interest.respondedAt = new Date();
    interest.brokerNotified = true;
    interest.notifiedAt = new Date();

    await interest.save();

    // Update matches count
    await Profile.findOneAndUpdate(
      { userId: interest.senderId },
      { $inc: { "statistics.matches": 1 } },
    );
    await Profile.findOneAndUpdate(
      { userId: interest.receiverId },
      { $inc: { "statistics.matches": 1 } },
    );

    console.log(
      `✅ Interest accepted: ${interest.senderId} <-> ${interest.receiverId}`,
    );

    res.status(200).json({
      message: "Interest accepted successfully",
      interest,
      brokerWillContact: true,
    });
  } catch (error) {
    console.error("Accept interest error:", error);
    res
      .status(500)
      .json({ message: "Failed to accept interest", error: error.message });
  }
};

// Reject interest - FIXED
exports.rejectInterest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interestId } = req.params;

    console.log(
      `📥 Reject interest request - User: ${userId}, Interest: ${interestId}`,
    );

    const interest = await Interest.findById(interestId);
    if (!interest) {
      console.log("❌ Interest not found");
      return res.status(404).json({ message: "Interest not found" });
    }

    console.log(
      `📋 Interest found - Sender: ${interest.senderId}, Receiver: ${interest.receiverId}`,
    );

    // Check if user is the receiver
    const receiverIdStr = interest.receiverId.toString();
    const userIdStr = userId.toString();

    if (receiverIdStr !== userIdStr) {
      console.log("❌ Not authorized - User is not the receiver");
      return res
        .status(403)
        .json({ message: "Not authorized to reject this interest" });
    }

    // Check if interest is pending
    if (interest.status !== "pending") {
      console.log(`❌ Interest status is not pending: ${interest.status}`);
      return res.status(400).json({ message: "Interest is not pending" });
    }

    // Update interest
    interest.status = "rejected";
    interest.respondedAt = new Date();

    await interest.save();

    console.log(
      `✅ Interest rejected: ${interest.senderId} <-> ${interest.receiverId}`,
    );

    res.status(200).json({
      message: "Interest rejected",
      interest,
    });
  } catch (error) {
    console.error("Reject interest error:", error);
    res
      .status(500)
      .json({ message: "Failed to reject interest", error: error.message });
  }
};

// Cancel interest
exports.cancelInterest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interestId } = req.params;

    const interest = await Interest.findById(interestId);
    if (!interest) {
      return res.status(404).json({ message: "Interest not found" });
    }

    // Check if user is the sender
    if (interest.senderId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this interest" });
    }

    // Check if interest is pending
    if (interest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot cancel interest that is not pending" });
    }

    // Update interest
    interest.status = "cancelled";

    await interest.save();

    res.status(200).json({
      message: "Interest cancelled",
      interest,
    });
  } catch (error) {
    console.error("Cancel interest error:", error);
    res
      .status(500)
      .json({ message: "Failed to cancel interest", error: error.message });
  }
};

// Get received interests
exports.getReceivedInterests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { receiverId: userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [interests, total] = await Promise.all([
      Interest.find(query)
        .populate("senderId", "fullName mobileNumber")
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
    console.error("Get received interests error:", error);
    res
      .status(500)
      .json({ message: "Failed to get interests", error: error.message });
  }
};

// Get sent interests
exports.getSentInterests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { senderId: userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [interests, total] = await Promise.all([
      Interest.find(query)
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
    console.error("Get sent interests error:", error);
    res
      .status(500)
      .json({ message: "Failed to get interests", error: error.message });
  }
};

// Get interest notifications count
exports.getNotificationsCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const pendingInterests = await Interest.countDocuments({
      receiverId: userId,
      status: "pending",
    });

    res.status(200).json({
      pendingInterests,
      totalNotifications: pendingInterests,
    });
  } catch (error) {
    console.error("Get notifications count error:", error);
    res
      .status(500)
      .json({ message: "Failed to get notifications", error: error.message });
  }
};
