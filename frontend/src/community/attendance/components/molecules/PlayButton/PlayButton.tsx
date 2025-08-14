import { CircularProgress, IconButton, useTheme } from "@mui/material";
import { JSX } from "react";

import { useUpdateEmployeeStatus } from "~community/attendance/api/AttendanceApi";
import { useGetTodaysTimeRequestAvailability } from "~community/attendance/api/AttendanceEmployeeApi";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { TooltipPlacement } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

import styles from "./styles";

const PlayButton = (): JSX.Element => {
  const theme = useTheme();
  const classes = styles();

  const { attendanceParams } = useAttendanceStore((state) => state);

  const status = attendanceParams.slotType;

  const translateText = useTranslator("attendanceModule", "timeWidget");
  const translateAria = useTranslator("attendanceAria", "timeWidget");

  const { isPending, mutate } = useUpdateEmployeeStatus();

  const {
    data: isTimeRequestAvailableToday,
    isLoading: isAvailabilityLoading
  } = useGetTodaysTimeRequestAvailability();

  const onClick = () => {
    switch (status) {
      case AttendanceSlotType.RESUME:
      case AttendanceSlotType.START:
        mutate(AttendanceSlotType.PAUSE);
        break;
      default:
        mutate(AttendanceSlotType.RESUME);
        break;
    }
  };

  const getTooltipText = () => {
    switch (status) {
      case AttendanceSlotType.RESUME:
      case AttendanceSlotType.START:
        return translateText(["takeABreak"]);
      case AttendanceSlotType.READY:
      case AttendanceSlotType.END:
      case AttendanceSlotType.LEAVE_DAY:
      case AttendanceSlotType.HOLIDAY:
      case AttendanceSlotType.NON_WORKING_DAY:
        return "";
      default:
        return translateText(["resumeWork"]);
    }
  };

  const getDisableStatus = () => {
    return (
      isPending ||
      status === AttendanceSlotType.READY ||
      status === AttendanceSlotType.END ||
      isTimeRequestAvailableToday ||
      isAvailabilityLoading ||
      status === AttendanceSlotType.HOLIDAY ||
      status === AttendanceSlotType.NON_WORKING_DAY ||
      status === AttendanceSlotType.LEAVE_DAY
    );
  };

  const getAriaLabel = () => {
    switch (status) {
      case AttendanceSlotType.RESUME:
      case AttendanceSlotType.START:
      case AttendanceSlotType.END:
        return translateAria(["pauseTimer"]);
      default:
        return translateAria(["startTimer"]);
    }
  };

  const getIcon = () => {
    if (isPending) {
      return <CircularProgress size={"0.75rem"} />;
    }

    switch (status) {
      case AttendanceSlotType.RESUME:
      case AttendanceSlotType.START:
        return (
          <Icon name={IconName.PAUSE_ICON} width="0.75rem" height="0.75rem" />
        );
      default:
        return (
          <Icon name={IconName.PLAY_ICON} width="0.75rem" height="0.75rem" />
        );
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case AttendanceSlotType.RESUME:
      case AttendanceSlotType.START:
        return theme.palette.amber[150];
      default:
        return theme.palette.greens.lightSecondary;
    }
  };

  const getComponent = () => {
    return (
      <IconButton
        sx={mergeSx([
          {
            background: getBackgroundColor(),
            "&:disabled": {
              backgroundColor: getBackgroundColor()
            }
          },
          classes.buttonComponent
        ])}
        onClick={onClick}
        onKeyDown={(e) => {
          if (shouldActivateButton(e.key)) {
            onClick();
          }
        }}
        disabled={getDisableStatus()}
        aria-label={getAriaLabel()}
      >
        {getIcon()}
      </IconButton>
    );
  };

  return getDisableStatus() ? (
    getComponent()
  ) : (
    <Tooltip
      id="play-button"
      title={getTooltipText()}
      placement={TooltipPlacement.BOTTOM}
      spanStyles={{
        borderRadius: "50%"
      }}
    >
      {getComponent()}
    </Tooltip>
  );
};

export default PlayButton;
