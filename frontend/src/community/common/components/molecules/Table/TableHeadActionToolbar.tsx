import { Box, Stack, SxProps, Theme, useTheme } from "@mui/material";
import { FC, JSX, useMemo } from "react";

import { mergeSx } from "~community/common/utils/commonUtil";

import styles from "./styles";

export interface TableHeadActionRowProps {
  firstRow?: {
    leftButton?: JSX.Element;
    rightButton?: JSX.Element;
  };
  secondRow?: {
    leftButton?: JSX.Element;
    rightButton?: JSX.Element;
  };
  customStyles?: {
    wrapper?: SxProps<Theme>;
    row?: SxProps<Theme>;
  };
}

const TableHeadActionToolbar: FC<TableHeadActionRowProps> = ({
  firstRow,
  secondRow,
  customStyles
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const isEnabled = useMemo(() => {
    return firstRow || secondRow;
  }, [firstRow, secondRow]);

  return (
    isEnabled && (
      <Stack
        sx={mergeSx([
          classes.actionToolbar.wrapper,
          {
            padding: isEnabled ? "1.375rem 0.75rem 0.5rem 0.75rem" : "0rem"
          },
          customStyles?.wrapper
        ])}
      >
        {firstRow && (
          <Stack sx={mergeSx([classes.actionToolbar.row, customStyles?.row])}>
            <Box>{firstRow.leftButton}</Box>
            <Box>{firstRow.rightButton}</Box>
          </Stack>
        )}
        {secondRow && (
          <Stack sx={mergeSx([classes.actionToolbar.row, customStyles?.row])}>
            <Box>{secondRow.leftButton}</Box>
            <Box>{secondRow.rightButton}</Box>
          </Stack>
        )}
      </Stack>
    )
  );
};

export default TableHeadActionToolbar;
