import { useTranslation } from "react-i18next";

export const useTranslator = (initial: string, ...keys: string[]) => {
  const { t } = useTranslation();
  const baseKey = `${[initial, ...keys].join(".")}`;

  return (suffixes: string[], interpolationValues?: Record<string, any>) => {
    const translationKey = `${baseKey}.${suffixes.join(".")}`;
    return (t(translationKey, interpolationValues) || "") as string;
  };
};
