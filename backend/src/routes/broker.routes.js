const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");

// Placeholder routes - you can add actual broker functionality later
router.get("/info", (req, res) => {
  res.status(200).json({
    officeName: "Shubha Mangalam Matrimony",
    address: "Bidar, Karnataka, India",
    phone: "+919110480411",
    whatsapp: "+918123427060",
    workingHours: {
      mondayToFriday: "9:00 AM - 8:00 PM",
      saturday: "10:00 AM - 6:00 PM",
      sunday: "Closed",
    },
  });
});

router.post("/callback", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Callback request received",
    callback: req.body,
  });
});

module.exports = router;
