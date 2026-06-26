import {
  Checkbox,
  TableHead as MuiTableHead,
  SxProps,
  TableCell,
  TableRow,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import { FC, MutableRefObject } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { TableHeaderTypes } from "~community/common/types/CommonTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import { CommonTableProps } from "./Table";
import styles from "./styles";

export interface TableHeadersProps {
  headers: TableHeaderTypes[];
  cellRefs: MutableRefObject<(HTMLTableCellElement | null)[][]>;
}

export interface TableHeadProps {
  customStyles?: {
    head?: SxProps<Theme>;
    row?: SxProps<Theme>;
    cell?: SxProps<Theme>;
    typography?: SxProps<Theme>;
  };
}

export interface TableHeadActionColumnProps {
  actionColumn?: {
    isEnabled?: boolean;
  };
}

const TableHead: FC<
  TableHeadProps & CommonTableProps & TableHeadActionColumnProps
> = ({
  rows,
  headers,
  customStyles,
  checkboxSelection,
  actionColumn = {
    isEnabled: false,
    styles: {
      cell: {},
      typography: {}
    }
  }
}) => {
  const translateAria = useTranslator(
    "commonAria",
    "components",
    "table",
    "tableHead"
  );
  const theme = useTheme();
  const classes = styles(theme);

  return (
    <MuiTableHead sx={mergeSx([classes.tableHead.head, customStyles?.head])}>
      <TableRow sx={mergeSx([classes.tableHead.row, customStyles?.row])}>
        {rows?.length > 0 &&
          checkboxSelection?.isEnabled &&
          checkboxSelection?.isSelectAllEnabled &&
          checkboxSelection?.isSelectAllVisible && (
            <TableCell
              scope="col"
              component="th"
              sx={mergeSx([
                classes.checkboxSelection.cell,
                classes.tableHead.checkboxSelection.cell,
                customStyles?.cell
              ])}
            >
              {checkboxSelection?.isSelectAllEnabled && (
                <Checkbox
                  color="primary"
                  checked={checkboxSelection?.isSelectAllChecked}
                  onChange={() => checkboxSelection?.handleSelectAllClick?.()}
                  sx={mergeSx([
                    classes.checkboxSelection.checkbox,
                    checkboxSelection?.customStyles?.checkbox
                  ])}
                  slotProps={{
                    input: {
                      "aria-label": translateAria(["checkbox"])
                    }
                  }}
                />
              )}
            </TableCell>
          )}

        {headers?.map((header) => (
          <TableCell
            scope="col"
            component="th"
            key={header?.id}
            sx={mergeSx([classes.tableHead.cell, customStyles?.cell])}
          >
            <Typography
              component="span"
              sx={mergeSx([
                classes.tableHead.typography,
                customStyles?.typography
              ])}
            >
              {header?.label}
            </Typography>
          </TableCell>
        ))}

        {actionColumn.isEnabled && (
          <TableCell
            scope="col"
            component="th"
            sx={mergeSx([
              classes.tableHead.actionColumn?.cell,
              customStyles?.cell
            ])}
          >
            <Typography
              component="span"
              sx={mergeSx([
                classes.tableHead.typography,
                customStyles?.typography
              ])}
            >
              Actions
            </Typography>
          </TableCell>
        )}
      </TableRow>
    </MuiTableHead>
  );
};

export default TableHead;
