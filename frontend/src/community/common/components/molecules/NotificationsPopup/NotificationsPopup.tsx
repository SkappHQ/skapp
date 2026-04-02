import { ButtonV2, EmptyDataView } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/navigation";
import { JSX, Key } from "react";

import { useMarkNotificationAsRead } from "~community/common/api/notificationsApi";
import ROUTES from "~community/common/constants/routes";
import { useScreenSizeRange } from "~community/common/hooks/useScreenSizeRange";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import {
  NotificationDataTypes,
  NotificationItemsTypes,
  NotifyFilterButtonTypes
} from "~community/common/types/notificationTypes";
import { handleNotifyRow } from "~community/common/utils/notificationUtils";

import Icon from "../../atoms/Icon/Icon";
import NotificationContent from "../NotificationContent/NotificationContent";

interface Props {
  handleCloseMenu: () => void;
  filterButton: NotifyFilterButtonTypes;
  notifications: NotificationDataTypes[];
}

const NotificationsPopup = ({
  handleCloseMenu,
  filterButton,
  notifications
}: Props): JSX.Element => {
  const { isSmallPhoneScreen } = useScreenSizeRange();
  const translateText = useTranslator("notifications");
  const router = useRouter();

  const handelAllNotification = (): void => {
    router.push(ROUTES.NOTIFICATIONS);
    handleCloseMenu();
  };

  const { mutate } = useMarkNotificationAsRead();

  const {
    isAttendanceEmployee,
    isLeaveEmployee,
    isLeaveManager,
    isAttendanceManager
  } = useSessionData();

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`${
          isSmallPhoneScreen ? "max-h-[44vh]" : "max-h-[calc(100vh-30rem)]"
        } overflow-y-auto mt-6`}
      >
        {notifications?.length === 0 ? (
          <EmptyDataView
            icon={
              filterButton === NotifyFilterButtonTypes.UNREAD ? (
                <Icon name={IconName.CHECK_CIRCLE_OUTLINED_ICON} />
              ) : undefined
            }
            title={
              filterButton === NotifyFilterButtonTypes.ALL
                ? translateText(["emptyScreenTitle"])
                : translateText(["emptyScreenTitleUnread"])
            }
            description={
              filterButton === NotifyFilterButtonTypes.ALL
                ? translateText(["emptyScreenDescription"])
                : translateText(["emptyScreenDescriptionUnread"])
            }
          />
        ) : (
          <>
            {notifications?.map(
              (item: NotificationDataTypes, index: Key | null | undefined) => (
                <div
                  key={index}
                  onClick={() => {
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
                    });
                  }}
                  tabIndex={0}
                  role="menuitem"
                >
                  <NotificationContent
                    isLeaveModuleDisabled={
                      item?.notificationType ===
                        NotificationItemsTypes.LEAVE_REQUEST && !isLeaveEmployee
                    }
                    isAttendanceModuleDisabled={
                      item?.notificationType ===
                        NotificationItemsTypes.TIME_ENTRY &&
                      !isAttendanceEmployee
                    }
                    item={item}
                  />
                </div>
              )
            )}
          </>
        )}
      </div>
      <ButtonV2
        variant={"tertiary"}
        onClick={handelAllNotification}
        disabled={notifications?.length === 0}
        icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
        iconPosition="end"
        isFullWidth
      >
        {translateText(["viewAllNotificationsButtonText"])}
      </ButtonV2>
    </div>
  );
};

export default NotificationsPopup;
