import { Box, Stack, Theme, Typography, useTheme } from "@mui/material";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

const LeavePolicyAllocationEmptyScreen = () => {
  const theme: Theme = useTheme();

  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "leavePolicyAllocation",
    "emptyScreen"
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        sx={{
          justifyContent: "center",
          alignItems: "center",
          height: "24.4375rem",
          border: "none"
        }}
      >
        <Stack
          component="div"
          sx={{
            width: "30.75rem",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: "1rem"
          }}
        >
          <Icon name={IconName.CALENDAR_ICON} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.125rem" }}>
            {translateText(["title"])}
          </Typography>
          <Typography
            component="div"
            variant="body2"
            sx={{ color: theme.palette.common.black, width: "100%" }}
          >
            {translateText(["description"])}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default LeavePolicyAllocationEmptyScreen;
