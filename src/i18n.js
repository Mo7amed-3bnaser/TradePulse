import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

// Get saved language from localStorage or default to 'en'
const savedLanguage =
  typeof window !== "undefined"
    ? localStorage.getItem("language-storage")
    : null;

let defaultLanguage = "en";
if (savedLanguage) {
  try {
    const parsed = JSON.parse(savedLanguage);
    defaultLanguage = parsed.state?.language || "en";
  } catch (e) {
    defaultLanguage = "en";
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: defaultLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
