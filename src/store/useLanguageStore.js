import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "../i18n";

const useLanguageStore = create(
  persist(
    (set) => ({
      language: "en",
      toggleLanguage: () =>
        set((state) => {
          const newLanguage = state.language === "en" ? "ar" : "en";
          // Update i18n language
          i18n.changeLanguage(newLanguage);
          // Update document direction and language
          if (typeof document !== "undefined") {
            document.documentElement.lang = newLanguage;
            document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
          }
          return { language: newLanguage };
        }),
      setLanguage: (language) =>
        set(() => {
          // Update i18n language
          i18n.changeLanguage(language);
          // Update document direction and language
          if (typeof document !== "undefined") {
            document.documentElement.lang = language;
            document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
          }
          return { language };
        }),
    }),
    {
      name: "language-storage",
    }
  )
);

// Initialize language on load
if (typeof document !== "undefined") {
  const stored = localStorage.getItem("language-storage");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      document.documentElement.lang = state.language;
      document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";
    } catch (e) {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    }
  } else {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }
}

export default useLanguageStore;
