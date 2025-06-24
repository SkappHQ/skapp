import { Box, Divider, Skeleton, Stack } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
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
import TableEmptyScreen from "../../molecules/TableEmptyScreen/TableEmptyScreen";

interface Props {
  data?: NotificationTypes;
  isLoading: boolean;
  refetch: () => void;
}

const Notifications = ({ data, isLoading }: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const { notifyData, setNotifyData } = useCommonStore((state) => state);
  const router = useRouter();
  const translateText = useTranslator("notifications");
  const { mutate } = useMarkNotificationAsRead();

  const {
    isAttendanceEmployee,
    isLeaveEmployee,
    isLeaveManager,
    isAttendanceManager
  } = useSessionData();

  return (
    <Box>
      <NotificationsFilter
        filterButton={notifyData.notificationFilterType}
        setFilterButton={(value) =>
          setNotifyData({
            notificationFilterType: value.filterButton
          })
        }
        isLoading={isLoading}
      />
      <Divider />
      <Box>
        {isLoading ? (
          <Skeleton
            variant="rounded"
            width="100%"
            height={409}
            animation="wave"
            sx={{ mt: "24px" }}
          />
        ) : data?.items.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              bgcolor: theme.palette.grey[50],
              mt: "24px",
              borderRadius: "12px"
            }}
          >
            <TableEmptyScreen
              title={
                notifyData.notificationFilterType ===
                NotifyFilterButtonTypes.ALL
                  ? translateText(["emptyScreenTitle"])
                  : translateText(["emptyScreenTitleUnread"])
              }
              description={translateText(["emptyScreenDescription"])}
            />
          </Stack>
        ) : (
          data?.items?.map((item: NotificationDataTypes) => (
            <Box
              key={item.id}
              sx={{
                cursor: item.isViewed ? "default" : "pointer"
              }}
            >
              <Box
                sx={{ pt: "24px", pb: "16px" }}
                onClick={() =>
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
                  item={item}
                />
              </Box>
              <Divider />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Notifications;
