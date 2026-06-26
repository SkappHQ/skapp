import { getRgbForBlink } from "../describedSelectionUtils";

describe("getRgbForBlink", () => {
  it("should return an empty string when animation is off", () => {
    const result = getRgbForBlink({
      isAnimationOn: false,
      color: "#FF0000"
    });

    expect(result).toBe("");
  });
});
