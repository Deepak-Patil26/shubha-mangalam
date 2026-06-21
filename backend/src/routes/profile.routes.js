const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const profileController = require("../controllers/profile.controller");
const { authenticateToken, isAdmin } = require("../middleware/auth.middleware");

// Profile validation
const profileValidation = [
  body("personalDetails.fullName")
    .notEmpty()
    .withMessage("Full name is required"),
  body("personalDetails.age")
    .isInt({ min: 18, max: 100 })
    .withMessage("Valid age is required"),
  body("personalDetails.dateOfBirth")
    .isISO8601()
    .withMessage("Valid date of birth is required"),
  body("personalDetails.gender")
    .isIn(["male", "female", "other"])
    .withMessage("Valid gender is required"),
  body("personalDetails.religion")
    .notEmpty()
    .withMessage("Religion is required"),
  body("personalDetails.caste").notEmpty().withMessage("Caste is required"),
  body("personalDetails.motherTongue")
    .notEmpty()
    .withMessage("Mother tongue is required"),
  body("personalDetails.education")
    .notEmpty()
    .withMessage("Education is required"),
  body("personalDetails.occupation")
    .notEmpty()
    .withMessage("Occupation is required"),
  body("personalDetails.annualIncome")
    .isNumeric()
    .withMessage("Valid annual income is required"),
  body("personalDetails.maritalStatus")
    .isIn(["unmarried", "divorced", "widowed", "separated"])
    .withMessage("Valid marital status is required"),
  body("personalDetails.height")
    .isNumeric()
    .withMessage("Valid height is required"),
  body("personalDetails.weight")
    .isNumeric()
    .withMessage("Valid weight is required"),
  body("personalDetails.location.state")
    .notEmpty()
    .withMessage("State is required"),
  body("personalDetails.location.city")
    .notEmpty()
    .withMessage("City is required"),
  body("familyDetails.fatherName")
    .notEmpty()
    .withMessage("Father name is required"),
  body("familyDetails.motherName")
    .notEmpty()
    .withMessage("Mother name is required"),
  body("familyDetails.familyBackground")
    .isIn(["nuclear", "joint", "extended"])
    .withMessage("Valid family background is required"),
  body("partnerPreferences.ageRange.min")
    .isInt({ min: 18 })
    .withMessage("Valid minimum age is required"),
  body("partnerPreferences.ageRange.max")
    .isInt({ max: 100 })
    .withMessage("Valid maximum age is required"),
  body("partnerPreferences.religion")
    .notEmpty()
    .withMessage("Partner religion preference is required"),
  body("partnerPreferences.caste")
    .notEmpty()
    .withMessage("Partner caste preference is required"),
  body("partnerPreferences.education")
    .notEmpty()
    .withMessage("Partner education preference is required"),
  body("partnerPreferences.occupation")
    .notEmpty()
    .withMessage("Partner occupation preference is required"),
];

// ============================================================
// ORDER MATTERS! Specific routes FIRST, catch-all routes LAST
// ============================================================

// 1. GET /my-profile - MUST BE FIRST
router.get("/my-profile", authenticateToken, profileController.getMyProfile);

// 2. POST /save
router.post(
  "/save",
  authenticateToken,
  profileValidation,
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

// ============================================================
// 9. DELETE /delete - DELETE OWN PROFILE (USER)
//     PERMANENTLY DELETES ACCOUNT AND PROFILE
// ============================================================
router.delete("/delete", authenticateToken, profileController.deleteOwnProfile);

// 10. DELETE /admin/delete/:id - Admin delete profile
router.delete(
  "/admin/delete/:id",
  authenticateToken,
  isAdmin,
  profileController.adminDeleteProfile,
);

// 11. GET /profile-by-user/:userId
router.get(
  "/profile-by-user/:userId",
  authenticateToken,
  profileController.getProfileByIdOrUserId,
);

// ============================================================
// 12. GET /:id - THIS MUST BE LAST!
//     It catches any ID that doesn't match the above routes
// ============================================================
router.get("/:id", authenticateToken, profileController.getProfileByIdOrUserId);

module.exports = router;
