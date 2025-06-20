import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { JSX } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { ButtonTypes } from "~community/common/enums/ComponentEnums";
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
        <Button
          label={translateTexts(["leaveCarryForwardUnEligibleModalButton"])}
          endIcon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          type={ButtonTypes.SUBMIT}
          onClick={() => {
            handleClose();
          }}
          accessibility={{
            ariaHidden: true
          }}
        />
      </Box>
    </Stack>
  );
};

export default NoCarryForwardLeaveTypes;
