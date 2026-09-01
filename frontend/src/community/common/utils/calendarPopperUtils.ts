import {
  CALENDAR_POPPER_HEIGHT_PX,
  CALENDAR_POPPER_OFFSET_PX,
  CALENDAR_POPPER_VIEWPORT_MARGIN_PX
} from "~community/common/constants/commonConstants";
import { type CalendarPopperPlacement } from "~community/common/types/CommonTypes";

export const BELOW_TRIGGER: CalendarPopperPlacement = {
  position: "bottom-start",
  offset: CALENDAR_POPPER_OFFSET_PX
};

export const ABOVE_TRIGGER: CalendarPopperPlacement = {
  position: "top-start",
  offset: CALENDAR_POPPER_OFFSET_PX
};

export const getCalendarPopperPlacement = (
  trigger: HTMLElement | null
): CalendarPopperPlacement => {
  if (!trigger) {
    return BELOW_TRIGGER;
  }

  const { top, bottom } = trigger.getBoundingClientRect();
  const spaceNeeded =
    CALENDAR_POPPER_OFFSET_PX +
    CALENDAR_POPPER_HEIGHT_PX +
    CALENDAR_POPPER_VIEWPORT_MARGIN_PX;

  if (bottom + spaceNeeded <= window.innerHeight) {
    return BELOW_TRIGGER;
  }

  if (top - spaceNeeded >= 0) {
    return ABOVE_TRIGGER;
  }

  const pinnedTop = Math.max(
    CALENDAR_POPPER_VIEWPORT_MARGIN_PX,
    window.innerHeight -
      CALENDAR_POPPER_VIEWPORT_MARGIN_PX -
      CALENDAR_POPPER_HEIGHT_PX
  );

  return { position: "bottom-start", offset: pinnedTop - bottom };
};
