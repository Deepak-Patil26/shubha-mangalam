const mongoose = require("mongoose");
require("dotenv").config();

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // Drop the email index
    await collection.dropIndex("email_1");
    console.log("✅ Dropped email_1 index");

    process.exit(0);
  } catch (error) {
    console.error("Error dropping index:", error);
    process.exit(1);
  }
}

dropIndex();
