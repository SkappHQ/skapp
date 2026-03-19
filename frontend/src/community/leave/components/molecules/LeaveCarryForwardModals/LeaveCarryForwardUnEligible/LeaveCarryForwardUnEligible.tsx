import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { JSX } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveCarryForwardModalTypes } from "~community/leave/types/LeaveCarryForwardTypes";

const LeaveCarryForwardUnEligible = (): JSX.Element => {
  const translateTexts = useTranslator("leaveModule", "leaveCarryForward");
  const { setIsLeaveCarryForwardModalOpen, setLeaveCarryForwardModalType } =
    useLeaveStore((state) => state);

  return (
    <Stack
      sx={{
        minWidth: "31.25rem"
      }}
    >
      <Typography
        sx={{
          mb: "1rem",
          color: "grey.900",
          width: "100%"
        }}
        variant="body1"
        id="leave-carry-forward-ineligible-modal-description"
      >
        {translateTexts(["leaveCarryForwardUnEligibleModalDescription"]) ?? ""}
      </Typography>
      <Box>
        <ButtonV2
          type={"submit"}
          onClick={() => {
            setIsLeaveCarryForwardModalOpen(true);
            setLeaveCarryForwardModalType(
              LeaveCarryForwardModalTypes.CARRY_FORWARD
            );
          }}
          icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          iconPosition="end"
        >
          {translateTexts(["leaveCarryForwardUnEligibleModalButton"])}
        </ButtonV2>
      </Box>
    </Stack>
  );
};

export default LeaveCarryForwardUnEligible;
