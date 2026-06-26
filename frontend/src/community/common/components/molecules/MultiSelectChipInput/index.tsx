import { type SxProps } from "@mui/material";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { FC } from "react";

import ChipList from "../ChipList";
import styles from "./styles";

interface MultiSelectChipInputProps {
  label: string;
  chipList: string[];
  chipStyles?: SxProps;
  hiddenChipStyles?: SxProps;
  chipWrapperStyles?: SxProps;
}

const MultiSelectChipInput: FC<MultiSelectChipInputProps> = ({
  label,
  chipStyles,
  chipWrapperStyles,
  hiddenChipStyles,
  chipList: chips
}) => {
  const classes = styles();

  return (
    // TODO: move styles to styles.ts
    <>
      <Typography component="label" lineHeight={1.5} sx={classes.label}>
        {label}
      </Typography>
      <Paper elevation={0} sx={classes.paper}>
        <ChipList
          chipList={chips}
          hiddenChipStyles={hiddenChipStyles}
          maxWidth={{ width: { xs: "100%" } }}
          chipStyles={chipStyles}
          chipWrapperStyles={{ width: "100%", ...chipWrapperStyles }}
        />
      </Paper>
    </>
  );
};

export default MultiSelectChipInput;
