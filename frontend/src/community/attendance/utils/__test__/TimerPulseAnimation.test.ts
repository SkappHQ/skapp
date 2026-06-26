import { keyframes } from "@emotion/react";

import { pulse } from "../TimerPulseAnimation";

describe("TimerPulseAnimation", () => {
  it("should define the correct transform values for pulse animation", () => {
    const pulseKeyframes = keyframes`
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(1);
      }
      100% {
        transform: scale(0);
      }
    `;

    const pulseTransformValues = pulse
      .toString()
      .match(/transform: scale\([^)]+\)/g);
    const expectedTransformValues = pulseKeyframes
      .toString()
      .match(/transform: scale\([^)]+\)/g);

    expect(pulseTransformValues).toEqual(expectedTransformValues);
  });
});
