import { Stack } from "@mui/material";
import { JSX } from "react";

import { useMarkAllNotificationsAsRead } from "~community/common/api/notificationsApi";

import { useScreenSizeRange } from "~community/common/hooks/useScreenSizeRange";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import { NotifyFilterButtonTypes } from "~community/common/types/notificationTypes";

import { Button } from "@rootcodelabs/skapp-ui";

interface Props {
  filterButton: NotifyFilterButtonTypes;
  setFilterButton: (value: { filterButton: NotifyFilterButtonTypes }) => void;
  isLoading?: boolean;
}

const NotificationsFilter = ({
  filterButton,
  setFilterButton,
  isLoading
}: Props): JSX.Element => {
  const { mutate } = useMarkAllNotificationsAsRead();

  const handleMarkAllRead = () => {
    mutate();
  };

  const { notifyData } = useCommonStore((state) => state);
  const translateText = useTranslator("notifications");
  const { isSmallPhoneScreen } = useScreenSizeRange();

  return (
    <Stack
      direction={isSmallPhoneScreen ? "column" : "row"}
      justifyContent="space-between"
      alignItems={isSmallPhoneScreen ? "flex-start" : "center"}
      pb={isSmallPhoneScreen ? "1rem" : "1.5rem"}
      pt={isSmallPhoneScreen ? "1rem" : "1.5rem"}
      gap={isSmallPhoneScreen ? 2 : 0}
      component="div"
    >
      <Stack direction={"row"} gap={isSmallPhoneScreen ? 1 : 2} component="div">
        <Button fullWidth={false} variant={
            filterButton === NotifyFilterButtonTypes.ALL
              ? "secondary"
              : "tertiary"
          } onClick={() =>
            setFilterButton({ filterButton: NotifyFilterButtonTypes.ALL })
          }>{translateText(["allFilterButtonText"])}</Button>
        <Button fullWidth={false} variant={
            filterButton === NotifyFilterButtonTypes.UNREAD
              ? "secondary"
              : "tertiary"
          } onClick={() =>
            setFilterButton({ filterButton: NotifyFilterButtonTypes.UNREAD })
          }>{translateText(["unreadFilterButtonText"])}</Button>
      </Stack>

      {!isLoading && notifyData.unreadCount !== 0 && (
        <Button fullWidth={isSmallPhoneScreen} variant={"tertiary"} onClick={() => {
            setFilterButton({ filterButton: NotifyFilterButtonTypes.ALL });
            handleMarkAllRead();
          }}>{translateText(["markAllAsReadButton"])}</Button>
      )}
    </Stack>
  );
};

export default NotificationsFilter;
