import { type PopperProps } from "@rootcodelabs/skapp-ui";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { type CalendarPopperPlacement } from "~community/common/types/CommonTypes";
import {
  BELOW_TRIGGER,
  getCalendarPopperPlacement
} from "~community/common/utils/calendarPopperUtils";

interface UseCalendarPopperPlacementReturn {
  triggerRef: RefObject<HTMLDivElement>;
  isCalendarOpen: boolean;
  calendarPopperProps: Pick<
    PopperProps,
    "position" | "offset" | "containerClassName"
  >;
  onCalendarOpenChange: (isOpen: boolean) => void;
}

/**
 * Keeps a skapp-ui DatePicker calendar reachable inside a modal by measuring
 * the trigger against the viewport on every open. See
 * getCalendarPopperPlacement for the placement rules.
 *
 * The Popper container caps its own height off the document height, not the
 * viewport, and clips with overflow-hidden - so overflow-y-auto is applied on
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
        setPlacement(getCalendarPopperPlacement(triggerRef.current));
      }
      setIsCalendarOpen(isOpen);
    }, []);

    // The Popper re-runs its own positioning on resize but reuses whatever
    // offset it was given, so a stale pinned offset would be re-applied against
    // a moved trigger. Re-measure while the calendar is open.
    useEffect(() => {
      if (!isCalendarOpen) {
        return;
      }

      const onViewportChange = (): void =>
        setPlacement(getCalendarPopperPlacement(triggerRef.current));

      window.addEventListener("resize", onViewportChange);

      return () => window.removeEventListener("resize", onViewportChange);
    }, [isCalendarOpen]);

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
