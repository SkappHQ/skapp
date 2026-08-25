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

/**
 * Picks the side of the trigger a skapp-ui DatePicker calendar fits on.
 *
 * The Popper always draws the calendar below its trigger, so a trigger that
 * sits low in a vertically centred modal pushes the last week rows past the
 * bottom of the viewport - where nothing can scroll them into view, because
 * the modal locks background scrolling. Prefers below, flips above when below
 * would overflow, and pins the calendar inside the viewport when neither side
 * fits by offsetting it back up over the trigger.
 */
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
