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
