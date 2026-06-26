import { Box, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC } from "react";

interface Props {
  text: string;
}

const HolidayChip: FC<Props> = ({ text }) => {
  const theme: Theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        backgroundColor: "transparent",
        padding: "0.25rem .75rem",
        borderRadius: 10,
        height: "fit-content",
        border: `1px solid ${theme.palette.grey[700]}`,
        width: "fit-content"
      }}
    >
      <Typography
        sx={{ color: theme.palette.text.secondary }}
        variant="caption"
      >
        {text}
      </Typography>
    </Box>
  );
};

export default HolidayChip;
