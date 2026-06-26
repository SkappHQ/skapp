import { Avatar, Theme, useTheme } from "@mui/material";
import { FC, KeyboardEvent, MouseEvent } from "react";

import ArrowFilledLeft from "~community/common/assets/Icons/ArrowFilledLeft";
import ArrowFilledRight from "~community/common/assets/Icons/ArrowFilledRight";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

interface Props {
  onClick: (
    event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>
  ) => void;
  disabled?: boolean;
  isRightArrow?: boolean;
  ariaLabel?: string;
  tabIndex?: number;
  backgroundColor?: string;
}

export const FilledArrow: FC<Props> = ({
  onClick,
  disabled = false,
  isRightArrow = true,
  ariaLabel,
  backgroundColor = "common.white",
  tabIndex = 0
}: Props) => {
  const theme: Theme = useTheme();

  const translateAria = useTranslator(
    "commonAria",
    "components",
    "filledArrowIcon"
  );

  return (
    <Avatar
      alt={isRightArrow ? translateAria(["right"]) : translateAria(["left"])}
      onClick={(e: MouseEvent<HTMLDivElement>) => {
        if (!disabled) {
          onClick(e);
        }
      }}
      aria-disabled={disabled}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (!disabled && shouldActivateButton(e.key)) {
          e.preventDefault();
          onClick(e);
        }
      }}
      sx={{
        cursor: disabled ? "default" : "pointer",
        backgroundColor: disabled ? "grey.50" : backgroundColor,
        height: "2.5rem",
        width: "2.5rem",
        borderRadius: "10rem"
      }}
      role="button"
      tabIndex={disabled ? -1 : tabIndex}
      aria-label={
        ariaLabel ??
        (isRightArrow ? translateAria(["right"]) : translateAria(["left"]))
      }
    >
      {isRightArrow ? (
        <ArrowFilledRight
          width={"4"}
          height={"8"}
          fill={disabled ? theme.palette.grey[800] : theme.palette.grey[400]}
        />
      ) : (
        <ArrowFilledLeft
          width={"4"}
          height={"8"}
          fill={disabled ? theme.palette.grey[800] : theme.palette.grey[400]}
        />
      )}
    </Avatar>
  );
};
