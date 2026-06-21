const express = require("express");
const router = express.Router();

// Simple translation endpoint
router.post("/", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    // If no Google Cloud API key, return original text
    if (!process.env.GOOGLE_CLOUD_API_KEY) {
      return res.status(200).json({
        translatedText: text,
        message: "Translation service not configured - returning original text",
      });
    }

    // For now, return original text until Google Cloud is configured
    res.status(200).json({
      translatedText: text,
      targetLanguage: targetLanguage,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Translation failed", error: error.message });
  }
});

router.post("/batch", async (req, res) => {
  try {
    const { texts, targetLanguage } = req.body;

    // Return original texts if no API key
    if (!process.env.GOOGLE_CLOUD_API_KEY) {
      return res.status(200).json({
        translations: texts,
        message: "Translation service not configured",
      });
    }

    res.status(200).json({
      translations: texts,
      targetLanguage: targetLanguage,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Batch translation failed", error: error.message });
  }
});

module.exports = router;
