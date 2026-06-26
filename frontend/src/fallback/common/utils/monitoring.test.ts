import { initializeHotjar } from "./monitoring";

describe("initializeHotjar", () => {
  it("should initialize Hotjar without throwing errors", () => {
    expect(() => initializeHotjar()).not.toThrow();
  });
});
