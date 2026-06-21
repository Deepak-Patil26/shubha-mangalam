import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentLanguage: "en",
  availableLanguages: [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "kn", name: "Kannada" },
    { code: "te", name: "Telugu" },
    { code: "ta", name: "Tamil" },
    { code: "mr", name: "Marathi" },
    { code: "ml", name: "Malayalam" },
  ],
  translations: {},
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
      localStorage.setItem("language", action.payload);
    },
    setTranslations: (state, action) => {
      state.translations = {
        ...state.translations,
        ...action.payload,
      };
    },
    clearTranslations: (state) => {
      state.translations = {};
    },
  },
});

export const { setLanguage, setTranslations, clearTranslations } =
  languageSlice.actions;
export default languageSlice.reducer;
