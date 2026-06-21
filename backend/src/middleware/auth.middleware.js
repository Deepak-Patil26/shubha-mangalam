const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" });
    }

    req.user = {
      id: user._id,
      mobile: user.mobileNumber,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res
      .status(500)
      .json({ message: "Authentication error", error: error.message });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Authorization error", error: error.message });
  }
};

exports.isBroker = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !["admin", "broker"].includes(user.role)) {
      return res.status(403).json({ message: "Broker access required" });
    }
    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Authorization error", error: error.message });
  }
};
