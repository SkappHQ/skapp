import { SxProps, TableCell, TableRow, Theme, useTheme } from "@mui/material";
import { FC, JSX } from "react";

import { mergeSx } from "~community/common/utils/commonUtil";

import TableSkeleton from "./TableSkeleton";
import styles from "./styles";

export interface TableBodyLoadingStateProps {
  headers: {
    id: string | number;
    label?: string;
    element?: JSX.Element;
  }[];
  loadingState?: {
    skeleton?: {
      rows?: number;
    };
    customStyles?: { row?: SxProps<Theme>; cell?: SxProps<Theme> };
  };
  isActionColumnEnabled?: boolean;
  isCheckboxSelectionEnabled?: boolean;
}

const TableBodyLoadingState: FC<TableBodyLoadingStateProps> = ({
  headers,
  loadingState,
  isActionColumnEnabled = false,
  isCheckboxSelectionEnabled = false
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  return (
    <TableRow
      sx={mergeSx([
        classes.tableBody.loadingState.row,
        loadingState?.customStyles?.row
      ])}
    >
      <TableCell
        colSpan={
          headers?.length +
          (isCheckboxSelectionEnabled ? 1 : 0) +
          (isActionColumnEnabled ? 1 : 0)
        }
        sx={mergeSx([
          classes.tableBody.loadingState.cell,
          loadingState?.customStyles?.cell
        ])}
      >
        <TableSkeleton rows={loadingState?.skeleton?.rows ?? 4} />
      </TableCell>
    </TableRow>
  );
};

export default TableBodyLoadingState;
