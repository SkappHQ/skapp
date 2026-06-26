import { Chip, type SxProps, useTheme } from "@mui/material";
import { FC } from "react";

import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import {
  getLabelForReadOnlyChip,
  mergeSx
} from "~community/common/utils/commonUtil";

import styles from "./styles";

interface Props {
  label?: string;
  chipStyles?: SxProps;
  isResponsive?: boolean;
  id?: string;
  dataTestId?: string;
}

const ReadOnlyChip: FC<Props> = ({
  label,
  isResponsive = false,
  chipStyles,
  id,
  dataTestId
}) => {
  const theme = useTheme();
  const classes = styles(theme);

  const queryMatches = useMediaQuery();
  const isBelow1024 = queryMatches(MediaQueries.BELOW_1024);

  return (
    <Chip
      id={id}
      data-testid={dataTestId}
      aria-label={label}
      label={getLabelForReadOnlyChip(isBelow1024, isResponsive, label)}
      sx={mergeSx([classes.chipContainer, chipStyles])}
    />
  );
};

export default ReadOnlyChip;
