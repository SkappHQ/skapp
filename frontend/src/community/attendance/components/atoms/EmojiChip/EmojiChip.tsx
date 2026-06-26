import { Box, CircularProgress, type SxProps, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";

import { durationSelector } from "~community/attendance/constants/constants";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { getEmoji } from "~community/common/utils/commonUtil";

interface Props {
  name: string;
  emoji: string;
  leaveType?: string;
  titleStyles?: SxProps;
  circleSize?: number;
  containerStyles?: SxProps;
}

const EmojiChip = ({
  name,
  emoji,
  leaveType,
  titleStyles,
  circleSize = 1.4,
  containerStyles
}: Props) => {
  const theme: Theme = useTheme();
  return (
    <Box
      sx={{
        pr: "0.5rem",
        borderRadius: "1.5rem",
        border: "0.0625rem solid",
        borderColor: theme.palette.grey[700],
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        ...containerStyles
      }}
    >
      <Box
        sx={{
          borderRadius: "1rem",
          width: "1.3rem",
          height: "1.3rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress
          sx={{
            transform:
              leaveType === LeaveStates.MORNING
                ? "rotate(90deg) !important"
                : "rotate(-90deg) !important",
            position: "absolute",
            color: `${theme.palette.error.contrastText} !important`,
            background: "transparent !important"
          }}
          size={`${circleSize}rem`}
          thickness={2}
          variant="determinate"
          value={
            leaveType === LeaveStates.MORNING ||
            leaveType === LeaveStates.EVENING
              ? 50
              : 100
          }
          aria-label={
            leaveType === LeaveStates.MORNING ||
            leaveType === LeaveStates.EVENING ||
            leaveType === LeaveStates.FULL_DAY
              ? `${durationSelector[leaveType ?? ""]} ${name}`
              : `${name}`
          }
        />
        <Typography fontSize={10}>{getEmoji(emoji)}</Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          letterSpacing: "0.03em",
          color: theme.palette.text.secondary,
          whiteSpace: "nowrap",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          ml: "0.25rem",
          ...titleStyles
        }}
      >
        {name}
      </Typography>
    </Box>
  );
};

export default EmojiChip;
