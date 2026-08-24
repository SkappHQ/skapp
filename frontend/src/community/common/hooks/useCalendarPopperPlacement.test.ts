import { act, renderHook } from "@testing-library/react";
import { MutableRefObject } from "react";

import { useCalendarPopperPlacement } from "~community/common/hooks/useCalendarPopperPlacement";

const TRIGGER_HEIGHT = 48;

const setViewportHeight = (height: number): void => {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
    writable: true
  });
};

const createTrigger = (top: number): HTMLDivElement => {
  const trigger = document.createElement("div");
  trigger.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + TRIGGER_HEIGHT,
      height: TRIGGER_HEIGHT
    }) as DOMRect;
  return trigger;
};

const openCalendarWith = (trigger: HTMLDivElement | null) => {
  const { result } = renderHook(() => useCalendarPopperPlacement());

  (
    result.current.triggerRef as MutableRefObject<HTMLDivElement | null>
  ).current = trigger;

  act(() => result.current.onCalendarOpenChange(true));

  return result;
};

describe("useCalendarPopperPlacement", () => {
  beforeEach(() => {
    setViewportHeight(626);
  });

  it("opens the calendar below the trigger when the viewport has room", () => {
    const result = openCalendarWith(createTrigger(100));

    expect(result.current.isCalendarOpen).toBe(true);
    expect(result.current.calendarPopperProps).toEqual({
      position: "bottom-start",
      offset: 8,
      containerClassName: "overflow-y-auto"
    });
  });

  it("opens the calendar above the trigger when it would overflow the bottom", () => {
    const result = openCalendarWith(createTrigger(400));

    expect(result.current.calendarPopperProps.position).toBe("top-start");
    expect(result.current.calendarPopperProps.offset).toBe(8);
  });

  it("pins the calendar inside the viewport when neither side fits", () => {
    setViewportHeight(500);

    const result = openCalendarWith(createTrigger(300));

    // Pinned 16px above the viewport bottom: 500 - 16 - 340 = 144, shifted up
    // from the trigger bottom at 348.
    expect(result.current.calendarPopperProps.position).toBe("bottom-start");
    expect(result.current.calendarPopperProps.offset).toBe(-204);
  });

  it("falls back to opening below the trigger before the trigger mounts", () => {
    const result = openCalendarWith(null);

    expect(result.current.calendarPopperProps.position).toBe("bottom-start");
    expect(result.current.calendarPopperProps.offset).toBe(8);
  });

  it("closes the calendar without recalculating the placement", () => {
    const result = openCalendarWith(createTrigger(400));

    act(() => result.current.onCalendarOpenChange(false));

    expect(result.current.isCalendarOpen).toBe(false);
    expect(result.current.calendarPopperProps.position).toBe("top-start");
  });
});
