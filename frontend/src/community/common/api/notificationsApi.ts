import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useFcmToken from "~enterprise/common/hooks/useFCMToken";

import { appModes } from "../constants/configs";
import { useCommonStore } from "../stores/commonStore";
import { SortKeyTypes, SortOrderTypes } from "../types/CommonTypes";
import {
  NotificationSummaryType,
  NotifyFilterButtonTypes
} from "../types/notificationTypes";
import authFetch from "../utils/axiosInterceptor";
import { getNotificationCount } from "../utils/notificationUtils";
import { notificationsEndpoints } from "./utils/ApiEndpoints";
import { notificationsQueryKeys } from "./utils/QueryKeys";

export const useGetNotifications = (
  page: number,
  size: number,
  sortOrder: SortOrderTypes,
  sortKey: SortKeyTypes
) => {
  const { notifyData } = useCommonStore((state) => state);
  let isViewed: "" | boolean = "";

  if (notifyData?.notificationFilterType === NotifyFilterButtonTypes.UNREAD) {
    isViewed = false;
  } else if (
    notifyData?.notificationFilterType === NotifyFilterButtonTypes.AllREAD
  ) {
    isViewed = true;
  }

  return useQuery({
    queryKey: [
      notificationsQueryKeys.GET_NOTIFICATIONS,
      page,
      size,
      sortOrder,
      sortKey,
      isViewed
    ],
    queryFn: async () => {
      const { data } = await authFetch.get(
        notificationsEndpoints.GET_NOTIFICATIONS(
          page,
          size,
          sortOrder,
          sortKey,
          isViewed
        )
      );
      return data;
    }
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  const { resetUnreadCount } = useFcmToken();
  const { setNotifyData } = useCommonStore((state) => state);

  return useMutation({
    mutationFn: async () => {
      await authFetch.patch(
        notificationsEndpoints.MARK_ALL_NOTIFICATION_AS_READ
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [notificationsQueryKeys.GET_NOTIFICATIONS]
      });
      setNotifyData({
        unreadCount: 0
      });
      resetUnreadCount();
    }
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { notifyData, setNotifyData } = useCommonStore((state) => state);

  return useMutation({
    mutationFn: async (notificationId: number) => {
      await authFetch.patch(
        notificationsEndpoints.MARK_NOTIFICATION_AS_READ(notificationId)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [notificationsQueryKeys.GET_NOTIFICATIONS]
      });

      if (notifyData.unreadCount > 0) {
        if (appModes.ENTERPRISE === process.env.APP_MODE) {
          const currentUnreadCount = parseInt(
            localStorage.getItem("unReadMsgCount") || "0"
          );

          const newUnreadCount = currentUnreadCount - 1;

          localStorage.setItem("unReadMsgCount", newUnreadCount.toString());
        }

        setNotifyData({
          unreadCount: notifyData.unreadCount - 1
        });
      }
    }
  });
};

export const useGetUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: [notificationsQueryKeys.GET_NOTIFICATIONS_COUNT],
    queryFn: async () => {
      const { data } = await authFetch.get(
        notificationsEndpoints.GET_NOTIFICATIONS_COUNT
      );
      return data.results[0];
    }
  });
};

export const useGetNotificationSummary = () => {
  return useQuery({
    queryKey: notificationsQueryKeys.GET_NOTIFICATION_SUMMARY,
    queryFn: async () => {
      const { data } = await authFetch.get(
        notificationsEndpoints.GET_NOTIFICATION_SUMMARY
      );
      return data;
    }
  });
};

export const useGetNotificationSummaryCount = (
  type: NotificationSummaryType
) => {
  const { data } = useGetNotificationSummary();
  return getNotificationCount(data?.results, type);
};

export const useMarkNotificationSummaryAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationType: NotificationSummaryType) => {
      await authFetch.patch(
        notificationsEndpoints.MARK_NOTIFICATION_SUMMARY_AS_READ,
        { notificationType }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.GET_NOTIFICATION_SUMMARY
      });
    },
    onError: (error) => {
      console.error("Failed to mark notification summary as read:", error);
    }
  });
};
