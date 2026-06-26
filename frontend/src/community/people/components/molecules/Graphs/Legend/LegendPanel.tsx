import { Box } from "@mui/material";
import { JSX } from "react";

import LegendItem from "./LegendItem";
import styles from "./styles";

interface Props {
  data?: { color: string; label: string }[];
}
const LegendPanel = ({ data }: Props): JSX.Element => {
  const classes = styles();

  return (
    <Box sx={classes.panel}>
      {data?.map((record: { color: string; label: string }) => {
        return (
          <LegendItem
            color={record.color}
            label={record.label}
            key={record.label}
          />
        );
      })}
    </Box>
  );
};

export default LegendPanel;
