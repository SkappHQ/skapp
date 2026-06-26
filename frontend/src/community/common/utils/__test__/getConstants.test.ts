import {
  APPLICATION_VERSION_INFO_URL,
  EIGHTY_PERCENT,
  NINETY_PERCENT,
  getApiUrl
} from "../getConstants";

describe("getConstants utility functions", () => {
  describe("getApiUrl", () => {
    it("should return the API URL from environment variables", () => {
      process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
      expect(getApiUrl()).toBe("https://api.example.com");
    });

    it("should return an empty string if NEXT_PUBLIC_API_URL is undefined", () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      expect(getApiUrl()).toBe("");
    });
  });

  describe("Constants", () => {
    it("should have NINETY_PERCENT as 90", () => {
      expect(NINETY_PERCENT).toBe(90);
    });

    it("should have EIGHTY_PERCENT as 80", () => {
      expect(EIGHTY_PERCENT).toBe(80);
    });

    it("should have APPLICATION_VERSION_INFO_URL as 'https://updates.skapp.com'", () => {
      expect(APPLICATION_VERSION_INFO_URL).toBe("https://updates.skapp.com");
    });
  });
});
