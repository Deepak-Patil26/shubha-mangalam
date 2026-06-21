const express = require("express");
const router = express.Router();
const searchController = require("../controllers/search.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/profiles", authenticateToken, searchController.searchProfiles);
router.get("/filters", authenticateToken, searchController.getSearchFilters);
router.get(
  "/recently-viewed",
  authenticateToken,
  searchController.getRecentlyViewed,
);

module.exports = router;
