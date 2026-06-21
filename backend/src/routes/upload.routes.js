const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { authenticateToken } = require("../middleware/auth.middleware");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

// Upload single file
router.post("/single", authenticateToken, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.status(200).json({
      message: "File uploaded successfully",
      file: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

// Upload multiple files
router.post(
  "/multiple",
  authenticateToken,
  upload.array("files", 5),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      res.status(200).json({
        message: "Files uploaded successfully",
        files: req.files.map((file) => ({
          filename: file.filename,
          path: file.path,
          size: file.size,
        })),
      });
    } catch (error) {
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  },
);

module.exports = router;
