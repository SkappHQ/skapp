import { Box, MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";
import { JSX, Key } from "react";

import { useMarkNotificationAsRead } from "~community/common/api/notificationsApi";
import ROUTES from "~community/common/constants/routes";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
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

import Button from "../../atoms/Button/Button";
import Icon from "../../atoms/Icon/Icon";
import NotificationContent from "../NotificationContent/NotificationContent";
import TableEmptyScreen from "../TableEmptyScreen/TableEmptyScreen";

interface Props {
  handleCloseMenu: () => void;
  filterButton: NotifyFilterButtonTypes;
  notifications: NotificationDataTypes[];
}

const NotificationsPopup = ({
  handleCloseMenu,
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
    <>
    <Box
      sx={{
        maxHeight: isSmallPhoneScreen ? "44vh" : "calc(100vh - 30rem)",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "0.25rem"
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#ccc",
          borderRadius: "0.25rem"
        }
      }}
    >
      {notifications?.length === 0 ? (
        <TableEmptyScreen
          title={translateText(["emptyScreenTitle"])}
          description={translateText(["emptyScreenDescription"])}
          customStyles={{
            wrapper: { height: "100%", py: "3rem" }
          }}
        />
      ) : (
        <>
          {notifications?.map(
            (item: NotificationDataTypes, index: Key | null | undefined) => (
              <MenuItem
                key={index}
                sx={{
                  pt: "1.75rem",
                  pb: "1rem",
                  cursor: item.isViewed ? "default" : "pointer",
                  "&:hover": { background: "transparent" }
                }}
                divider
                disableGutters
                disableRipple
                onClick={() => {
                  handleNotifyRow({
                    id: item.id,
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
                  item={item}
                />
              </MenuItem>
            )
          )}
          
        </>
      )}
    </Box>
    <Button
            buttonStyle={ButtonStyle.TERTIARY}
            label={translateText(["viewAllNotificationsButtonText"])}
            endIcon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
            styles={{ mt: "1rem" }}
            onClick={handelAllNotification}
            disabled={notifications?.length === 0}
          />
         </> 
  );
};

export default NotificationsPopup;
