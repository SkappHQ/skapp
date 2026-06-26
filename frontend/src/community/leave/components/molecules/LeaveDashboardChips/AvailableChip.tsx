import { Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC } from "react";

interface Props {
  text: string;
}

const AvailableChip: FC<Props> = ({ text }) => {
  const theme: Theme = useTheme();

  return (
    <Stack
      sx={{
        flexDirection: "row",
        alignItems: "center",
        gap: 1,
        backgroundColor: theme.palette.greens.lighter,
        padding: "0.25rem .75rem",
        borderRadius: 10,
        height: "fit-content",
        width: "fit-content"
      }}
    >
      <Typography
        sx={{ color: theme.palette.greens.deepShadows }}
        variant="caption"
      >
        {" "}
        {text}
      </Typography>
    </Stack>
  );
};

export default AvailableChip;
