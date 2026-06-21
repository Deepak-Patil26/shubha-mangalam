const express = require("express");
const router = express.Router();
const interestController = require("../controllers/interest.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.post("/send", authenticateToken, interestController.sendInterest);
router.put(
  "/:interestId/accept",
  authenticateToken,
  interestController.acceptInterest,
);
router.put(
  "/:interestId/reject",
  authenticateToken,
  interestController.rejectInterest,
);
router.delete(
  "/:interestId/cancel",
  authenticateToken,
  interestController.cancelInterest,
);
router.get(
  "/received",
  authenticateToken,
  interestController.getReceivedInterests,
);
router.get("/sent", authenticateToken, interestController.getSentInterests);
router.get(
  "/notifications/count",
  authenticateToken,
  interestController.getNotificationsCount,
);

module.exports = router;
