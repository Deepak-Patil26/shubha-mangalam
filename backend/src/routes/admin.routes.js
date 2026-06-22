const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authenticateToken, isAdmin } = require("../middleware/auth.middleware");

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

// Dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);

// Users Management
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserDetails);
router.put("/users/:id/suspend", adminController.suspendUser);
router.put("/users/:id/unsuspend", adminController.unsuspendUser);
router.delete("/users/:id", adminController.deleteUser);

// Profile Management
router.post("/profiles/create", adminController.createBrokerProfile);
router.delete("/profiles/:id", adminController.deleteProfile);

// Callbacks Management
router.get("/callbacks", adminController.getAllCallbacks);
router.put("/callbacks/:id", adminController.updateCallbackStatus);

// Complaints Management
router.get("/complaints", adminController.getAllComplaints);
router.put("/complaints/:id", adminController.updateComplaintStatus);

// Success Stories Management
router.post("/success-stories", adminController.createSuccessStory);
router.get("/success-stories", adminController.getAllSuccessStories);
router.put("/success-stories/:id", adminController.updateSuccessStory);
router.put("/success-stories/:id/approve", adminController.approveSuccessStory);
router.delete("/success-stories/:id", adminController.deleteSuccessStory);

// Testimonials Management
router.get("/testimonials", adminController.getAllTestimonials);
router.post("/testimonials", adminController.createTestimonial);
router.put("/testimonials/:id", adminController.updateTestimonial);
router.delete("/testimonials/:id", adminController.deleteTestimonial);

// Interests Management
router.get("/interests", adminController.getAllInterests);
router.put("/interests/:id", adminController.updateInterestStatus);

module.exports = router;
