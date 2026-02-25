import { Stack } from "@mui/material";
import { JSX } from "react";

import { useMarkAllNotificationsAsRead } from "~community/common/api/notificationsApi";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useScreenSizeRange } from "~community/common/hooks/useScreenSizeRange";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import { NotifyFilterButtonTypes } from "~community/common/types/notificationTypes";

import Button from "../../atoms/Button/Button";

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
        <Button
          label={translateText(["allFilterButtonText"])}
          isFullWidth={false}
          buttonStyle={
            filterButton === NotifyFilterButtonTypes.ALL
              ? ButtonStyle.SECONDARY
              : ButtonStyle.TERTIARY
          }
          styles={{
            py: isSmallPhoneScreen ? "0.625rem" : "0.75rem",
            px: "1.25rem",
            fontSize: isSmallPhoneScreen ? "0.75rem" : "0.875rem",
            lineHeight: "1.3125rem"
          }}
          onClick={() =>
            setFilterButton({ filterButton: NotifyFilterButtonTypes.ALL })
          }
        />
        <Button
          label={translateText(["unreadFilterButtonText"])}
          isFullWidth={false}
          buttonStyle={
            filterButton === NotifyFilterButtonTypes.UNREAD
              ? ButtonStyle.SECONDARY
              : ButtonStyle.TERTIARY
          }
          styles={{
            py: isSmallPhoneScreen ? "0.625rem" : "0.75rem",
            px: "1.25rem",
            fontSize: isSmallPhoneScreen ? "0.75rem" : "0.875rem",
            lineHeight: "1.3125rem",
            display: notifyData.unreadCount !== 0 ? "block" : "none"
          }}
          onClick={() =>
            setFilterButton({ filterButton: NotifyFilterButtonTypes.UNREAD })
          }
        />
      </Stack>

      {!isLoading && notifyData.unreadCount !== 0 && (
        <Button
          label={translateText(["markAllAsReadButton"])}
          isFullWidth={isSmallPhoneScreen}
          buttonStyle={ButtonStyle.TERTIARY}
          styles={{
            py: isSmallPhoneScreen ? "0.625rem" : "0.75rem",
            px: "1.25rem",
            fontSize: isSmallPhoneScreen ? "0.75rem" : "0.875rem",
            lineHeight: "1.3125rem"
          }}
          onClick={() => {
            setFilterButton({ filterButton: NotifyFilterButtonTypes.ALL });
            handleMarkAllRead();
          }}
        />
      )}
    </Stack>
  );
};

export default NotificationsFilter;
