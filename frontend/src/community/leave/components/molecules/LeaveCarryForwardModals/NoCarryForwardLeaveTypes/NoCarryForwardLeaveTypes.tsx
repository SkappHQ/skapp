import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { JSX } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  handleClose: () => void;
}

const NoCarryForwardLeaveTypes = ({ handleClose }: Props): JSX.Element => {
  const translateTexts = useTranslator("leaveModule", "leaveCarryForward");
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
        id="no-carry-forward-leave-types-modal-description"
      >
        {translateTexts([
          "leaveCarryForwardLeaveTypesNotAvailableModalDescription"
        ]) ?? ""}
      </Typography>
      <Box>
        <ButtonV2
          type={"submit"}
          onClick={() => {
            handleClose();
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

export default NoCarryForwardLeaveTypes;
