import { Box } from "@mui/material";
import { SxProps } from "@mui/material/styles";
import { KeyboardEvent } from "react";

import {
  GRAPH_LEFT,
  GRAPH_RIGHT
} from "~community/attendance/utils/echartOptions/constants";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

import styles from "./styles";

interface Props {
  tabIndex?: number;
  hasData: boolean;
  handleClick: (direction: string) => void;
  handleChevronVisibility: (direction: "left" | "right") => string;
  leftAriaLabel: string;
  rightAriaLabel: string;
  leftStyles?: SxProps | undefined;
  rightStyles?: SxProps | undefined;
}

const ChartNavigationArrows = ({
  tabIndex,
  hasData,
  handleClick,
  handleChevronVisibility,
  leftAriaLabel,
  rightAriaLabel,
  leftStyles,
  rightStyles
}: Props) => {
  const classes = styles();

  if (!hasData) {
    return null;
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    direction: string
  ) => {
    if (shouldActivateButton(event.key)) {
      event.preventDefault();
      handleClick(direction);
    }
  };

  return (
    <>
      <Box
        tabIndex={tabIndex}
        role="button"
        aria-label={leftAriaLabel}
        onClick={() => handleClick(GRAPH_LEFT)}
        sx={mergeSx([
          classes.leftArrowStyles(handleChevronVisibility(GRAPH_LEFT)),
          leftStyles
        ])}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) =>
          handleKeyDown(event, GRAPH_LEFT)
        }
      >
        <Icon name={IconName.CHEVRON_LEFT_ICON} />
      </Box>

      <Box
        tabIndex={tabIndex}
        role="button"
        aria-label={rightAriaLabel}
        onClick={() => handleClick(GRAPH_RIGHT)}
        sx={mergeSx([
          classes.rightArrowStyles(handleChevronVisibility(GRAPH_RIGHT)),
          rightStyles
        ])}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) =>
          handleKeyDown(event, GRAPH_RIGHT)
        }
      >
        <Icon name={IconName.CHEVRON_RIGHT_ICON} />
      </Box>
    </>
  );
};

export default ChartNavigationArrows;
