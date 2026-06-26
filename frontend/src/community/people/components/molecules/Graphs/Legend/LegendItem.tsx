import { Box, Typography } from "@mui/material";
import { JSX } from "react";

import styles from "./styles";

interface Props {
  color: string;
  label: string;
}
const LegendItem = ({ color, label }: Props): JSX.Element => {
  const classes = styles();

  return (
    <Box sx={classes.legendItem}>
      <Box
        sx={{
          width: ".6rem",
          height: ".6rem",
          borderRadius: "5rem",
          background: color
        }}
      />
      <Typography sx={classes.text}>{label}</Typography>
    </Box>
  );
};

export default LegendItem;
