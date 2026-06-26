import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import { english } from "~community/common/assets/languages/english/english";
import { english as enterpriseEnglish } from "~enterprise/common/assets/languages/english/english";

const isEnterpriseMode = process.env.NEXT_PUBLIC_MODE === "enterprise";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    resources: {
      en: {
        translation: isEnterpriseMode ? enterpriseEnglish : english
      }
    },
    interpolation: {
      escapeValue: false
    }
  })
  .catch((error) => console.error(error));

export default i18n;
