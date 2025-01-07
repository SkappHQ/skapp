import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import { english } from "~community/common/assets/languages/english/english";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    resources: {
      en: {
        translation: english
      }
    },
    interpolation: {
      escapeValue: false
    }
  })
  .catch((error) => console.error(error));

export default i18n;
