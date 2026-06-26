import { NotifyFilterButtonTypes } from "~community/common/types/notificationTypes";
import { SetType } from "~community/common/types/storeTypes";

interface NotificationSliceType {
  notifyData: {
    unreadCount: number;
    isUnreadCountVisible: boolean;
    notificationFilterType: NotifyFilterButtonTypes;
  };
  setNotifyData: (value: {
    unreadCount?: number;
    isUnreadCountVisible?: boolean;
    notificationFilterType?: NotifyFilterButtonTypes;
  }) => void;
}

export const notificationsSlice = (
  set: SetType<NotificationSliceType>
): NotificationSliceType => ({
  notifyData: {
    unreadCount: 0,
    isUnreadCountVisible: false,
    notificationFilterType: NotifyFilterButtonTypes.ALL
  },
  setNotifyData: (value) =>
    set((state) => ({
      ...state,
      notifyData: {
        ...state.notifyData,
        ...value
      }
    }))
});
