import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC } from "react";

import { styles } from "./styles";

interface Props {
  label: string;
  numberOfColors?: number;
}

const ColorPaletteSkeleton: FC<Props> = ({ label, numberOfColors = 7 }) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  return (
    <>
      <Stack>
        <Typography sx={classes.label}>{label}</Typography>
        <Box sx={classes.wrapper}>
          {Array.from({ length: numberOfColors }, (_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              width="1.75rem"
              height="1.75rem"
              sx={classes.skeleton}
              animation="wave"
              data-testid={`skeleton-${index}`}
            />
          ))}
        </Box>
      </Stack>
    </>
  );
};

export default ColorPaletteSkeleton;
