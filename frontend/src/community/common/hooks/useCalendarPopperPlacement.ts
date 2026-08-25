import { type PopperProps } from "@rootcodelabs/skapp-ui";
import { RefObject, useCallback, useMemo, useRef, useState } from "react";

import {
  CALENDAR_POPPER_HEIGHT_PX,
  CALENDAR_POPPER_OFFSET_PX,
  CALENDAR_POPPER_VIEWPORT_MARGIN_PX
} from "~community/common/constants/commonConstants";

type CalendarPopperPlacement = Required<
  Pick<PopperProps, "position" | "offset">
>;

interface UseCalendarPopperPlacementReturn {
  triggerRef: RefObject<HTMLDivElement>;
  isCalendarOpen: boolean;
  calendarPopperProps: Pick<
    PopperProps,
    "position" | "offset" | "containerClassName"
  >;
  onCalendarOpenChange: (isOpen: boolean) => void;
}

const BELOW_TRIGGER: CalendarPopperPlacement = {
  position: "bottom-start",
  offset: CALENDAR_POPPER_OFFSET_PX
};

const ABOVE_TRIGGER: CalendarPopperPlacement = {
  position: "top-start",
  offset: CALENDAR_POPPER_OFFSET_PX
};

const getPlacement = (
  trigger: HTMLDivElement | null
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

/**
 * Keeps a skapp-ui DatePicker calendar reachable inside a modal.
 *
 * The Popper always draws the calendar below its trigger, so a trigger that
 * sits low in a vertically centred modal pushes the last week rows past the
 * bottom of the viewport — where nothing can scroll them into view, because the
 * modal locks background scrolling. This picks the side of the trigger the
 * calendar actually fits on, and offsets it back up over the trigger when
 * neither side fits.
 *
 * The Popper container caps its own height off the document height, not the
 * viewport, and clips with overflow-hidden — so overflow-y-auto is applied on
 * every open, not just the pinned case, to make whatever it caps scrollable.
 */
export const useCalendarPopperPlacement =
  (): UseCalendarPopperPlacementReturn => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
    const [placement, setPlacement] =
      useState<CalendarPopperPlacement>(BELOW_TRIGGER);

    const onCalendarOpenChange = useCallback((isOpen: boolean): void => {
      if (isOpen) {
        setPlacement(getPlacement(triggerRef.current));
      }
      setIsCalendarOpen(isOpen);
    }, []);

    const calendarPopperProps = useMemo(
      () => ({ ...placement, containerClassName: "overflow-y-auto" }),
      [placement]
    );

    return {
      triggerRef,
      isCalendarOpen,
      calendarPopperProps,
      onCalendarOpenChange
    };
  };
