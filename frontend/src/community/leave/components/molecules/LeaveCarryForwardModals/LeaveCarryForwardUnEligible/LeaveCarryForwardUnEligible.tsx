import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { JSX } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { ButtonTypes } from "~community/common/enums/ComponentEnums";
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
        <Button
          accessibility={{
            ariaHidden: true
          }}
          label={translateTexts(["leaveCarryForwardUnEligibleModalButton"])}
          endIcon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          type={ButtonTypes.SUBMIT}
          onClick={() => {
            setIsLeaveCarryForwardModalOpen(true);
            setLeaveCarryForwardModalType(
              LeaveCarryForwardModalTypes.CARRY_FORWARD
            );
          }}
        />
      </Box>
    </Stack>
  );
};

export default LeaveCarryForwardUnEligible;
