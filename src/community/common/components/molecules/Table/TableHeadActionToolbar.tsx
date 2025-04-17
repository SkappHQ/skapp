import { Box, Stack, SxProps, Theme, useTheme } from "@mui/material";
import { FC, JSX, useMemo } from "react";

import { TableTypes } from "~community/common/types/CommonTypes";
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

const TableHeadActionToolbar: FC<TableTypes & TableHeadActionRowProps> = ({
  firstRow,
  secondRow,
  customStyles,
  tableName
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
        role="toolbar"
        aria-label={`${tableName}-table-head-action-toolbar`}
      >
        {firstRow && (
          <Stack
            sx={mergeSx([classes.actionToolbar.row, customStyles?.row])}
            role="group"
            aria-label={`${tableName}-table-head-action-toolbar-primary-actions`}
          >
            <Box>{firstRow.leftButton}</Box>
            <Box>{firstRow.rightButton}</Box>
          </Stack>
        )}
        {secondRow && (
          <Stack
            sx={mergeSx([classes.actionToolbar.row, customStyles?.row])}
            role="group"
            aria-label={`${tableName}-table-head-action-toolbar-secondary-actions`}
          >
            <Box>{secondRow.leftButton}</Box>
            <Box>{secondRow.rightButton}</Box>
          </Stack>
        )}
      </Stack>
    )
  );
};

export default TableHeadActionToolbar;
