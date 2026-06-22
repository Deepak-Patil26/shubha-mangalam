const express = require("express");
const router = express.Router();
const callbackController = require("../controllers/callback.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// User routes
router.post("/request", authenticateToken, callbackController.requestCallback);
router.get(
  "/my-requests",
  authenticateToken,
  callbackController.getMyCallbacks,
);

module.exports = router;
