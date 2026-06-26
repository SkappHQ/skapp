import { Box, Stack } from "@mui/material";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import {
  GraphTraverseTypes,
  ToggleState
} from "~community/leave/types/TeamLeaveAnalyticsTypes";

interface Props {
  isDisplay: boolean;
  toggleNeeded?: boolean;
  toggle?: ToggleState;
  monthIndex: GraphTraverseTypes;
  moveChart: (duration: "LEFT" | "RIGHT") => void;
  bottomPosition?: string;
  leftPosition?: string;
  rightPosition?: string;
}

const ChartXAxisTraverse = ({
  isDisplay = false,
  toggleNeeded,
  toggle,
  monthIndex,
  moveChart,
  bottomPosition = ".625rem",
  leftPosition = "5%",
  rightPosition = "2%"
}: Props) => {
  const areAllTogglesCleared = (): boolean => {
    if (toggle) {
      return Object.values(toggle).every((value) => !value);
    }
  };

  if (!areAllTogglesCleared()) {
    return (
      <Box
        sx={{
          height: "100%",
          position: "relative"
        }}
        display={
          (isDisplay && toggle) || (isDisplay && !toggleNeeded)
            ? "block"
            : "none"
        }
      >
        <Stack
          sx={{
            position: "absolute",
            bottom: bottomPosition,
            left: leftPosition,
            cursor: "pointer",
            visibility: monthIndex?.min === 0 ? "hidden" : "visible"
          }}
          onClick={() => moveChart("LEFT")}
        >
          <Icon name={IconName.CHEVRON_LEFT_ICON} />
        </Stack>
        <Stack
          sx={{
            position: "absolute",
            bottom: bottomPosition,
            right: rightPosition,
            cursor: "pointer",
            visibility: monthIndex?.max === 11 ? "hidden" : "visible"
          }}
          onClick={() => moveChart("RIGHT")}
        >
          <Icon name={IconName.CHEVRON_RIGHT_ICON} />
        </Stack>
      </Box>
    );
  }
};

export default ChartXAxisTraverse;
