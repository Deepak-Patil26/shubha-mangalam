const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Validation rules
const registerValidation = [
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("mobileNumber")
    .isMobilePhone()
    .withMessage("Valid mobile number is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

const loginValidation = [
  body("mobileNumber")
    .isMobilePhone()
    .withMessage("Valid mobile number is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

// Routes
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.post(
  "/change-password",
  authenticateToken,
  changePasswordValidation,
  authController.changePassword,
);
router.get("/me", authenticateToken, authController.getCurrentUser);
router.post("/logout", authenticateToken, authController.logout);

module.exports = router;
