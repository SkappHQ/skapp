import { Box, SxProps, Typography } from "@mui/material";
import { JSX, ReactNode } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

interface Props {
  customComponent?: ReactNode;
  description?: string | JSX.Element;
  ids?: {
    title?: string;
    description?: string;
    closeButton?: string;
  };
  primaryBtn: {
    label: string;
    onClick: () => void;
    isDisabled?: boolean;
    buttonStyle?: ButtonStyle;
    startIcon?: IconName;
    endIcon?: IconName;
    styles?: SxProps;
  };
  secondaryBtn?: {
    label: string;
    onClick: () => void;
    isDisabled?: boolean;
    buttonStyle?: ButtonStyle;
    startIcon?: IconName;
    endIcon?: IconName;
    styles?: SxProps;
  };
}

const UserPromptModal = ({
  customComponent,
  ids,
  description,
  primaryBtn,
  secondaryBtn
}: Props) => {
  const classes = styles();

  return (
    <Box component="div">
      {customComponent}
      <Typography id={ids?.description ?? "user-prompt-modal-description"}>
        {description}
      </Typography>
      <Button
        accessibility={{
          ariaHidden: true
        }}
        label={primaryBtn.label}
        styles={{ ...classes.btn, ...primaryBtn.styles } as SxProps}
        buttonStyle={primaryBtn.buttonStyle ?? ButtonStyle.PRIMARY}
        startIcon={primaryBtn?.startIcon}
        endIcon={primaryBtn.endIcon}
        disabled={primaryBtn.isDisabled ?? false}
        onClick={primaryBtn.onClick}
      />
      {secondaryBtn && (
        <Button
          accessibility={{
            ariaHidden: true
          }}
          label={secondaryBtn?.label}
          styles={{ ...classes.btn, ...secondaryBtn?.styles } as SxProps}
          buttonStyle={secondaryBtn?.buttonStyle ?? ButtonStyle.TERTIARY}
          startIcon={secondaryBtn?.startIcon}
          endIcon={secondaryBtn?.endIcon}
          disabled={secondaryBtn?.isDisabled ?? false}
          onClick={secondaryBtn?.onClick}
        />
      )}
    </Box>
  );
};

export default UserPromptModal;
