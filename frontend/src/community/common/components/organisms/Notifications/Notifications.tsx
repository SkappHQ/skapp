import { EmptyDataView, Spinner } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/navigation";
import { JSX } from "react";

import { useMarkNotificationAsRead } from "~community/common/api/notificationsApi";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import {
  NotificationDataTypes,
  NotificationItemsTypes,
  NotificationTypes,
  NotifyFilterButtonTypes
} from "~community/common/types/notificationTypes";
import { handleNotifyRow } from "~community/common/utils/notificationUtils";

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
            title={
              notifyData.notificationFilterType === NotifyFilterButtonTypes.ALL
                ? translateText(["emptyScreenTitle"])
                : translateText(["emptyScreenTitleUnread"])
            }
            description={translateText(["emptyScreenDescription"])}
          />
        ) : (
          data?.items?.map((item: NotificationDataTypes) => (
            <div
              key={item.id}
              className={item.isViewed ? "cursor-default" : "cursor-pointer"}
            >
              <button
                type="button"
                className="pt-6 pb-4 w-full text-left"
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
                      NotificationItemsTypes.LEAVE_REQUEST && !isLeaveEmployee
                  }
                  isAttendanceModuleDisabled={
                    item?.notificationType ===
                      NotificationItemsTypes.TIME_ENTRY && !isAttendanceEmployee
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
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
