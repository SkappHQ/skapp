import { useCallback, useEffect, useRef, useState } from "react";

import { SpecialNotificationType } from "~community/common/enums/SpecialNotificationEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useSpecialNotifications } from "~community/common/providers/SpecialNotificationProvider";
import {
  useGetTodaysBirthdayNotifications,
  useGetUserPersonalDetails,
  useMarkBirthdayNotificationsViewedToday
} from "~community/people/api/PeopleApi";
import {
  BirthdayNotificationPayloadType,
  BirthdayQueueEntryType
} from "~community/people/types/BirthdayNotificationTypes";
import {
  buildBirthdayQueue,
  normalizeEmployeeId
} from "~community/people/utils/birthdayNotificationUtils";

interface BirthdayNotificationsType {
  currentEntry: BirthdayQueueEntryType | null;
  position: number;
  total: number;
  onDismiss: () => void;
}

const UNAUTHENTICATED = "unauthenticated";

const useBirthdayNotifications = (): BirthdayNotificationsType => {
  const { sessionStatus, employeeDetails } = useSessionData();
  const {
    isEligible,
    today,
    evaluationTick,
    isViewedToday,
    persistViewedDate
  } = useSpecialNotifications();

  const { data: currentEmployee, isPending: isCurrentEmployeePending } =
    useGetUserPersonalDetails();

  const currentEmployeeId =
    normalizeEmployeeId(employeeDetails?.employeeId) ??
    normalizeEmployeeId(currentEmployee?.employeeId);

  const isCurrentEmployeeResolved =
    currentEmployeeId !== undefined || !isCurrentEmployeePending;

  const [queue, setQueue] = useState<BirthdayQueueEntryType[]>([]);
  const [cursor, setCursor] = useState(0);

  const seededDataRef = useRef<BirthdayNotificationPayloadType | null>(null);
  const isShowingRef = useRef(false);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const shouldEvaluate =
    isEligible && !isViewedToday(SpecialNotificationType.BIRTHDAY);

  const markBirthdayViewedDate = useCallback(
    (lastViewedDate: string) => {
      persistViewedDate(SpecialNotificationType.BIRTHDAY, lastViewedDate);
    },
    [persistViewedDate]
  );

  const { mutate: markViewed } = useMarkBirthdayNotificationsViewedToday(
    markBirthdayViewedDate
  );

  const { data, refetch } = useGetTodaysBirthdayNotifications(shouldEvaluate);

  useEffect(() => {
    if (!data) return;
    if (seededDataRef.current === data) return;
    if (!shouldEvaluate) return;
    if (isShowingRef.current) return;
    if (!isCurrentEmployeeResolved) return;

    seededDataRef.current = data;

    if (data.lastViewedDate) {
      markBirthdayViewedDate(data.lastViewedDate);
    }

    const birthdayQueue = buildBirthdayQueue(
      data.employeeBirthdays,
      currentEmployeeId
    );

    if (birthdayQueue.length === 0) {
      if (data.lastViewedDate !== today) {
        markViewed();
      }
      return;
    }

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    isShowingRef.current = true;
    setQueue(birthdayQueue);
    setCursor(0);
  }, [
    data,
    shouldEvaluate,
    today,
    currentEmployeeId,
    isCurrentEmployeeResolved,
    markViewed,
    markBirthdayViewedDate
  ]);

  const finishSequence = useCallback(() => {
    isShowingRef.current = false;
    setQueue([]);
    setCursor(0);
    markViewed();

    requestAnimationFrame(() => {
      const elementToRestore = restoreFocusRef.current;
      if (elementToRestore && document.contains(elementToRestore)) {
        elementToRestore.focus?.();
      }
      restoreFocusRef.current = null;
    });
  }, [markViewed]);

  const onDismiss = useCallback(() => {
    const nextCursor = cursor + 1;

    if (nextCursor < queue.length) {
      setCursor(nextCursor);
      return;
    }

    finishSequence();
  }, [cursor, queue.length, finishSequence]);

  useEffect(() => {
    if (evaluationTick === 0) return;
    if (!shouldEvaluate) return;
    if (isShowingRef.current) return;
    if (!navigator.onLine) return;

    refetch({ cancelRefetch: false });
  }, [evaluationTick, shouldEvaluate, refetch]);

  useEffect(() => {
    if (sessionStatus !== UNAUTHENTICATED) return;

    seededDataRef.current = null;
    isShowingRef.current = false;
    restoreFocusRef.current = null;
    setQueue([]);
    setCursor(0);
  }, [sessionStatus]);

  return {
    currentEntry: queue[cursor] ?? null,
    position: cursor + 1,
    total: queue.length,
    onDismiss
  };
};

export default useBirthdayNotifications;
