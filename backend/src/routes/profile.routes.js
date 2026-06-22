const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const profileController = require("../controllers/profile.controller");
const { authenticateToken, isAdmin } = require("../middleware/auth.middleware");

// ============================================================
// NO VALIDATION - All fields are optional
// ============================================================

// 1. GET /my-profile
router.get("/my-profile", authenticateToken, profileController.getMyProfile);

// 2. POST /save - NO VALIDATION
router.post(
  "/save",
  authenticateToken,
  profileController.createOrUpdateProfile,
);

// 3. POST /profile-image
router.post(
  "/profile-image",
  authenticateToken,
  profileController.uploadProfileImage,
);

// 4. POST /photos
router.post("/photos", authenticateToken, profileController.uploadPhotos);

// 5. PUT /photos/profile-picture
router.put(
  "/photos/profile-picture",
  authenticateToken,
  profileController.setProfilePicture,
);

// 6. DELETE /photos/:photoId
router.delete(
  "/photos/:photoId",
  authenticateToken,
  profileController.deletePhoto,
);

// 7. POST /save-favorite
router.post("/save-favorite", authenticateToken, profileController.saveProfile);

// 8. GET /saved/list
router.get(
  "/saved/list",
  authenticateToken,
  profileController.getSavedProfiles,
);

// 9. POST /:profileId/view - Track profile view
router.post(
  "/:profileId/view",
  authenticateToken,
  profileController.trackProfileView,
);

// 10. DELETE /delete - DELETE OWN PROFILE
router.delete("/delete", authenticateToken, profileController.deleteOwnProfile);

// 11. DELETE /admin/delete/:id - Admin delete profile
router.delete(
  "/admin/delete/:id",
  authenticateToken,
  isAdmin,
  profileController.adminDeleteProfile,
);

// 12. GET /profile-by-user/:userId
router.get(
  "/profile-by-user/:userId",
  authenticateToken,
  profileController.getProfileByIdOrUserId,
);

// 13. GET /:id - MUST BE LAST
router.get("/:id", authenticateToken, profileController.getProfileByIdOrUserId);

module.exports = router;
