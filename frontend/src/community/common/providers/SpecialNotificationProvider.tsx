import { useRouter } from "next/router";
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import { IsAProtectedUrlWithDrawer } from "~community/auth/utils/authUtils";
import { SpecialNotificationType } from "~community/common/enums/SpecialNotificationEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import {
  SpecialNotificationContextType,
  SpecialNotificationViewedCacheType
} from "~community/common/types/SpecialNotificationTypes";
import { isSuperAdminOnlySession } from "~community/common/utils/commonUtil";
import { getDateForPeriod } from "~community/common/utils/dateTimeUtils";
import {
  clearViewedCache,
  isViewedToday as isViewedTodayForType,
  readViewedCache,
  withViewedDate,
  writeViewedCache
} from "~community/common/utils/specialNotificationUtils";

const AUTHENTICATED = "authenticated";
const UNAUTHENTICATED = "unauthenticated";

const SpecialNotificationContext =
  createContext<SpecialNotificationContextType | null>(null);

const SpecialNotificationProvider: FC<{ children: ReactNode }> = ({
  children
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { sessionStatus, userId } = useSessionData();

  const [hasHydrated, setHasHydrated] = useState(false);
  const [viewedCache, setViewedCache] =
    useState<SpecialNotificationViewedCacheType | null>(null);
  const [evaluationTick, setEvaluationTick] = useState(0);

  const viewedCacheRef = useRef<SpecialNotificationViewedCacheType | null>(
    null
  );

  const today = getDateForPeriod("day", "start");

  useEffect(() => {
    const hydratedCache = readViewedCache();
    viewedCacheRef.current = hydratedCache;
    setViewedCache(hydratedCache);
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setEvaluationTick((previousTick) => previousTick + 1);
    };

    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router.events]);

  useEffect(() => {
    if (sessionStatus !== UNAUTHENTICATED) return;

    clearViewedCache();
    viewedCacheRef.current = null;
    setViewedCache(null);
  }, [sessionStatus]);

  const isEligible =
    hasHydrated &&
    sessionStatus === AUTHENTICATED &&
    !isSuperAdminOnlySession(user?.roles) &&
    IsAProtectedUrlWithDrawer(router.asPath);

  const isViewedToday = useCallback(
    (specialNotificationType: SpecialNotificationType) =>
      isViewedTodayForType(viewedCache, specialNotificationType, today, userId),
    [viewedCache, today, userId]
  );

  const persistViewedDate = useCallback(
    (
      specialNotificationType: SpecialNotificationType,
      lastViewedDate: string
    ) => {
      if (userId === undefined) return;

      const nextCache = withViewedDate(
        viewedCacheRef.current,
        userId,
        specialNotificationType,
        lastViewedDate
      );

      viewedCacheRef.current = nextCache;
      writeViewedCache(nextCache);
      setViewedCache(nextCache);
    },
    [userId]
  );

  const value = useMemo(
    () => ({
      isEligible,
      today,
      evaluationTick,
      isViewedToday,
      persistViewedDate
    }),
    [isEligible, today, evaluationTick, isViewedToday, persistViewedDate]
  );

  return (
    <SpecialNotificationContext.Provider value={value}>
      {children}
    </SpecialNotificationContext.Provider>
  );
};

const useSpecialNotifications = (): SpecialNotificationContextType => {
  const context = useContext(SpecialNotificationContext);

  if (!context) {
    throw new Error(
      "useSpecialNotifications must be used within a SpecialNotificationProvider"
    );
  }

  return context;
};

export { SpecialNotificationProvider, useSpecialNotifications };
