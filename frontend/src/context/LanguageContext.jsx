import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const LanguageContext = createContext();

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "kn", name: "Kannada" },
  { code: "te", name: "Telugu" },
  { code: "ta", name: "Tamil" },
  { code: "mr", name: "Marathi" },
  { code: "ml", name: "Malayalam" },
];

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved || "en";
  });
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("language", currentLanguage);
  }, [currentLanguage]);

  const translateText = async (text, targetLanguage) => {
    if (targetLanguage === "en" || !text) return text;

    try {
      const response = await axios.post("/api/translate", {
        text,
        targetLanguage,
      });
      return response.data.translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  const translateBatch = async (texts, targetLanguage) => {
    if (targetLanguage === "en" || !texts || texts.length === 0) return texts;

    try {
      const response = await axios.post("/api/translate/batch", {
        texts,
        targetLanguage,
      });
      return response.data.translations;
    } catch (error) {
      console.error("Batch translation error:", error);
      return texts;
    }
  };

  const setLanguage = async (languageCode) => {
    setIsLoading(true);
    setCurrentLanguage(languageCode);
    // Translations will be fetched when needed
    setIsLoading(false);
  };

  const value = {
    currentLanguage:
      SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
      SUPPORTED_LANGUAGES[0],
    languages: SUPPORTED_LANGUAGES,
    setLanguage,
    translateText,
    translateBatch,
    isLoading,
    isTranslating: isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
