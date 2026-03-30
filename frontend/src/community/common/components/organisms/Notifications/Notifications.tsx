import { EmptyDataView, Spinner } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/navigation";
import { JSX, useMemo } from "react";

import { useMarkNotificationAsRead } from "~community/common/api/notificationsApi";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import { IconName } from "~community/common/types/IconTypes";
import {
  NotificationDataTypes,
  NotificationItemsTypes,
  NotificationTypes,
  NotifyFilterButtonTypes
} from "~community/common/types/notificationTypes";
import {
  groupNotificationsByTimePeriod,
  handleNotifyRow
} from "~community/common/utils/notificationUtils";

import Icon from "../../atoms/Icon/Icon";
import NotificationContent from "../../molecules/NotificationContent/NotificationContent";
import NotificationsFilter from "../../molecules/NotificationsFilter/NotificationsFilter";

interface Props {
  data?: NotificationTypes;
  isLoading: boolean;
}

const Notifications = ({ data, isLoading }: Props): JSX.Element => {
  const { notifyData, setNotifyData } = useCommonStore((state) => state);
  const router = useRouter();
  const translateText = useTranslator("notifications");
  const { mutate } = useMarkNotificationAsRead();

  const {
    isAttendanceEmployee,
    isLeaveEmployee,
    isLeaveManager,
    isAttendanceManager,
    isEsignatureModuleEnabled
  } = useSessionData();

  const groupedNotifications = useMemo(
    () => (data?.items ? groupNotificationsByTimePeriod(data.items) : []),
    [data?.items]
  );

  return (
    <div className="px-12 flex gap-4 flex-col">
      <NotificationsFilter
        filterButton={notifyData.notificationFilterType}
        setFilterButton={(value) =>
          setNotifyData({
            notificationFilterType: value.filterButton
          })
        }
      />
      <div>
        {isLoading ? (
          <Spinner size={50} />
        ) : data?.items.length === 0 ? (
          <EmptyDataView
            icon={
              notifyData.notificationFilterType ===
              NotifyFilterButtonTypes.UNREAD ? (
                <Icon name={IconName.CHECK_CIRCLE_OUTLINED_ICON} />
              ) : undefined
            }
            title={
              notifyData.notificationFilterType === NotifyFilterButtonTypes.ALL
                ? translateText(["emptyScreenTitle"])
                : translateText(["emptyScreenTitleUnread"])
            }
            description={
              notifyData.notificationFilterType === NotifyFilterButtonTypes.ALL
                ? translateText(["emptyScreenDescription"])
                : translateText(["emptyScreenDescriptionUnread"])
            }
          />
        ) : (
          groupedNotifications.map((group) => (
            <div key={group.period} className="flex flex-col gap-3 pb-5">
              <h2 className="text-secondary-icon uppercase body1">
                {translateText([group.period])}
              </h2>
              <div>
                {group.items.map((item: NotificationDataTypes) => (
                  <div key={item.id}>
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() =>
                        handleNotifyRow({
                          id: item.id,
                          resourceId: item.resourceId,
                          notificationType: item.notificationType,
                          isCausedByCurrentUser: item.isCausedByCurrentUser,
                          router,
                          mutate,
                          isLeaveEmployee,
                          isLeaveManager,
                          isAttendanceManager,
                          isAttendanceEmployee
                        })
                      }
                    >
                      <NotificationContent
                        isLeaveModuleDisabled={
                          item?.notificationType ===
                            NotificationItemsTypes.LEAVE_REQUEST &&
                          !isLeaveEmployee
                        }
                        isAttendanceModuleDisabled={
                          item?.notificationType ===
                            NotificationItemsTypes.TIME_ENTRY &&
                          !isAttendanceEmployee
                        }
                        isEsignatureModuleDisabled={
                          (item?.notificationType ===
                            NotificationItemsTypes.ESIGN_DOCUMENT_SIGN_REQUEST ||
                            item?.notificationType ===
                              NotificationItemsTypes.ESIGN_DOCUMENT_COMPLETED ||
                            item?.notificationType ===
                              NotificationItemsTypes.ESIGN_DOCUMENT_DECLINED ||
                            item?.notificationType ===
                              NotificationItemsTypes.ESIGN_DOCUMENT_VOIDED ||
                            item?.notificationType ===
                              NotificationItemsTypes.ESIGN_DOCUMENT_REMINDER ||
                            item?.notificationType ===
                              NotificationItemsTypes.ESIGN_DOCUMENT_EXPIRED ||
                            item?.notificationType ===
                              NotificationItemsTypes.ESIGN_DOCUMENT_COMPLETED_OWNER ||
                            item?.notificationType ===
                              NotificationItemsTypes.ESIGN_DOCUMENT_DECLINED_OWNER) &&
                          !isEsignatureModuleEnabled
                        }
                        item={item}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
