import { useCallback, useEffect, useRef, useState } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import {
  useGetTodaysBirthdayNotifications,
  useGetUserPersonalDetails,
  useMarkBirthdayNotificationsViewedToday
} from "~community/people/api/PeopleApi";
import { useBirthdayNotificationContext } from "~community/people/providers/BirthdayNotificationProvider";
import {
  BirthdayNotificationPayloadType,
  BirthdayNotificationsType,
  BirthdayQueueEntryType
} from "~community/people/types/BirthdayNotificationTypes";
import {
  buildBirthdayQueue,
  normalizeEmployeeId
} from "~community/people/utils/birthdayNotificationUtils";

const UNAUTHENTICATED = "unauthenticated";

const useBirthdayNotifications = (): BirthdayNotificationsType => {
  const { sessionStatus, employeeDetails } = useSessionData();
  const {
    isEligible,
    today,
    evaluationTick,
    isViewedToday,
    cacheLastViewedDate
  } = useBirthdayNotificationContext();

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

  const shouldEvaluate = isEligible && !isViewedToday;

  const { mutate: markViewed } =
    useMarkBirthdayNotificationsViewedToday(cacheLastViewedDate);

  const { data, refetch } = useGetTodaysBirthdayNotifications(shouldEvaluate);

  useEffect(() => {
    if (!data) return;
    if (seededDataRef.current === data) return;
    if (!shouldEvaluate) return;
    if (isShowingRef.current) return;
    if (!isCurrentEmployeeResolved) return;

    seededDataRef.current = data;

    if (data.lastViewedDate) {
      cacheLastViewedDate(data.lastViewedDate);
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
    cacheLastViewedDate
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
