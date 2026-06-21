const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
require("dotenv").config();

// Import routes
const authRoutes = require("./src/routes/auth.routes");
const profileRoutes = require("./src/routes/profile.routes");
const searchRoutes = require("./src/routes/search.routes");
const interestRoutes = require("./src/routes/interest.routes");
const brokerRoutes = require("./src/routes/broker.routes");
const adminRoutes = require("./src/routes/admin.routes");
const translationRoutes = require("./src/routes/translation.routes");
const uploadRoutes = require("./src/routes/upload.routes");
const publicRoutes = require("./src/routes/public.routes");

// Import middleware
const { errorHandler } = require("./src/middleware/error.middleware");

const app = express();

// Fix for Render proxy warning
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://shubha-mangalam-frontend.vercel.app",
        "https://shubha-mangalam.vercel.app",
        "https://shubhamangalam.com",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(compression());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================================
// ROUTES - NO authenticateToken middleware here
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/broker", brokerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/translate", translationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/public", publicRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Shubha Mangalam API is running" });
});

// Error handling
app.use(errorHandler);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Shubha Mangalam server running on port ${PORT}`);
  console.log(`📋 Available routes:`);
  console.log(`   POST /api/profiles/photos - Upload photos`);
  console.log(`   GET  /api/profiles/my-profile - Get profile`);
  console.log(`   POST /api/profiles/save - Save profile`);
  console.log(`   GET  /api/public/stats - Public stats`);
  console.log(`   GET  /api/public/success-stories - Public success stories`);
  console.log(`   POST /api/auth/register - Register`);
  console.log(`   POST /api/auth/login - Login`);
});

module.exports = app;
