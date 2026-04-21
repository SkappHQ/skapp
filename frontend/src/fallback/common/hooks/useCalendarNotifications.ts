interface NotificationParams {
  success?: string;
  error?: string;
  type?: string;
}

export const useCalendarNotifications = () => {
  const showNotification = (params: NotificationParams) => {
  };

  return { showNotification };
};
