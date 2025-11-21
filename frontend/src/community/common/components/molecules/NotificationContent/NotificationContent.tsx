import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { JSX } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { NotificationDataTypes, notificationDefaultImage } from "~community/common/types/notificationTypes";
import { fromDateToRelativeTime } from "~community/common/utils/dateTimeUtils";
import i18n from "~i18n";

import Avatar from "../Avatar/Avatar";

interface Props {
  item: NotificationDataTypes;
  isLeaveModuleDisabled?: boolean;
  isAttendanceModuleDisabled?: boolean;
}

const NotificationContent = ({
  item,
  isLeaveModuleDisabled,
  isAttendanceModuleDisabled
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("notifications");

  const isViewed =
    item.isViewed ||
    isLeaveModuleDisabled === true ||
    isAttendanceModuleDisabled === true;
  
  return (
    <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
      <Box>
        <Avatar
          firstName={""}
          lastName={""}
          alt={item.title}
          src={item.authPic ?? notificationDefaultImage}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "normal",
            fontSize: "1rem",
            fontWeight: 700,
            lineHeight: "160%"
          }}
          color={!isViewed ? "primary.dark" : theme.palette.grey.A100}
        >
          {item?.body}
        </Typography>
        <Typography
          variant="inherit"
          color={!isViewed ? "primary.dark" : theme.palette.grey.A100}
          sx={{ fontSize: "0.75rem", fontWeight: 700, mt: "1rem" }}
        >
          {fromDateToRelativeTime(
            item.createdDate,
            translateText,
            i18n.language
          )}
        </Typography>
      </Box>
      {!isViewed && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            minWidth: "3.625rem"
          }}
        >
          <Box
            sx={{
              width: "0.688rem",
              height: "0.688rem",
              bgcolor: "primary.dark",
              borderRadius: "3.125rem"
            }}
          ></Box>
        </Box>
      )}
    </Stack>
  );
};

export default NotificationContent;
