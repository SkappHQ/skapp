import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { JSX } from "react";

interface Props {
  title: string;
  time: string;
  icon: JSX.Element;
}

const TimesheetStatCard = ({ title, time, icon }: Props) => {
  const theme: Theme = useTheme();
  return (
    <Box
      sx={{
        flex: 1,
        paddingY: "0.8438rem",
        paddingX: "1.5rem",
        bgcolor: theme.palette.grey[50],
        borderRadius: "1.5rem"
      }}
    >
      <Stack
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Box>
          <Typography variant={"body2"}>{title}</Typography>
          {time ? (
            <Typography variant={"h2"}>{time}</Typography>
          ) : (
            <Typography variant={"h2"}>-- --</Typography>
          )}
        </Box>
        <Box
          sx={{
            height: "3.5625rem",
            width: "3.5625rem",
            backgroundColor: theme.palette.secondary.main,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "1.25rem"
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
};

export default TimesheetStatCard;
