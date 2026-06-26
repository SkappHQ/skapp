export const getApiUrl = (): string => {
  const API_URL: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  return API_URL ?? "";
};

export const NINETY_PERCENT = 90;
export const EIGHTY_PERCENT = 80;
export const APPLICATION_VERSION_INFO_URL = "https://updates.skapp.com";
