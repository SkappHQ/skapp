import { Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC } from "react";

interface Props {
  text: string;
}

const AwayChip: FC<Props> = ({ text }) => {
  const theme: Theme = useTheme();

  return (
    <Stack
      sx={{
        flexDirection: "row",
        alignItems: "center",
        gap: 1,
        backgroundColor: theme.palette.error.light,
        height: "fit-content",
        padding: "0.25rem .75rem",
        borderRadius: 10,
        width: "fit-content"
      }}
    >
      <Typography
        sx={{ color: theme.palette.text.darkerText }}
        variant="caption"
      >
        {" "}
        {text}
      </Typography>
    </Stack>
  );
};

export default AwayChip;
