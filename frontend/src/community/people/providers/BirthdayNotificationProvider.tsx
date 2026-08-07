import { useRouter } from "next/router";
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import { IsAProtectedUrlWithDrawer } from "~community/auth/utils/authUtils";
import { isSuperAdminOnlySession } from "~community/common/utils/commonUtil";
import { getDateForPeriod } from "~community/common/utils/dateTimeUtils";
import useBirthdayViewedCache from "~community/people/hooks/useBirthdayViewedCache";
import { BirthdayNotificationContextType } from "~community/people/types/BirthdayNotificationTypes";

const BirthdayNotificationContext =
  createContext<BirthdayNotificationContextType | null>(null);

const BirthdayNotificationProvider: FC<{ children: ReactNode }> = ({
  children
}) => {
  const router = useRouter();
  const { user } = useAuth();

  const [evaluationTick, setEvaluationTick] = useState(0);

  const today = getDateForPeriod("day", "start");

  const { isCacheLoaded, isViewedToday, cacheLastViewedDate } =
    useBirthdayViewedCache(today);

  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setEvaluationTick((previousTick) => previousTick + 1);
    };

    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router.events]);

  const isEligible =
    isCacheLoaded &&
    !!user &&
    !isSuperAdminOnlySession(user?.roles) &&
    IsAProtectedUrlWithDrawer(router.asPath);

  const value = useMemo(
    () => ({
      isEligible,
      today,
      evaluationTick,
      isViewedToday,
      cacheLastViewedDate
    }),
    [isEligible, today, evaluationTick, isViewedToday, cacheLastViewedDate]
  );

  return (
    <BirthdayNotificationContext.Provider value={value}>
      {children}
    </BirthdayNotificationContext.Provider>
  );
};

const useBirthdayNotificationContext = (): BirthdayNotificationContextType => {
  const context = useContext(BirthdayNotificationContext);

  if (!context) {
    throw new Error(
      "useBirthdayNotificationContext must be used within a BirthdayNotificationProvider"
    );
  }

  return context;
};

export { BirthdayNotificationProvider, useBirthdayNotificationContext };
