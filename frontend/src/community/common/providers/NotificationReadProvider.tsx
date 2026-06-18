import { FC, ReactNode, createContext, useEffect } from "react";

import { useMarkNotificationSummaryAsRead } from "../api/notificationsApi";
import { NotificationSummaryType } from "../types/notificationTypes";

interface NotificationReadProviderProps {
  children: ReactNode;
  notificationType: NotificationSummaryType;
}

const NotificationReadContext = createContext<null>(null);

const NotificationReadProvider: FC<NotificationReadProviderProps> = ({
  children,
  notificationType
}) => {
  const { mutate: markAsRead } = useMarkNotificationSummaryAsRead();

  useEffect(() => {
    markAsRead(notificationType);
  }, [markAsRead, notificationType]);

  return (
    <NotificationReadContext.Provider value={null}>
      {children}
    </NotificationReadContext.Provider>
  );
};

export default NotificationReadProvider;
