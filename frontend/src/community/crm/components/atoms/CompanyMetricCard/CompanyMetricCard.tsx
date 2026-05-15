import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FC, JSX } from "react";

import styles from "./styles";

interface Props {
  title: string;
  amount: string;
  chip?: JSX.Element;
}

const CompanyMetricCard: FC<Props> = ({ title, amount, chip }) => {
  const theme = useTheme();
  const classes = styles(theme);

  return (
    <Box sx={classes.wrapper}>
      <Typography sx={classes.title}>{title}</Typography>
      <Box sx={classes.valueRow}>
        <Typography sx={classes.amount}>{amount}</Typography>
        {chip}
      </Box>
    </Box>
  );
};

export default CompanyMetricCard;