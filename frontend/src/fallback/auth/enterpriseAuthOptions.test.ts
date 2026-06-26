import { enterpriseAuthOptions } from "./enterpriseAuthOptions";

describe("enterpriseAuthOptions", () => {
  it("should have a providers property", () => {
    expect(enterpriseAuthOptions).toHaveProperty("providers");
    expect(Array.isArray(enterpriseAuthOptions.providers)).toBe(true);
  });

  it("should initialize providers as an empty array", () => {
    expect(enterpriseAuthOptions.providers).toEqual([]);
  });
});
