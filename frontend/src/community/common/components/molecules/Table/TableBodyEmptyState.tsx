import { SxProps, TableCell, TableRow, Theme, useTheme } from "@mui/material";
import { FC, JSX } from "react";

import TableEmptyScreen, {
  TableEmptyScreenProps
} from "~community/common/components/molecules/TableEmptyScreen/TableEmptyScreen";
import { mergeSx } from "~community/common/utils/commonUtil";

import styles from "./styles";

export interface TableBodyEmptyStateProps {
  headers: {
    id: string | number;
    label?: string;
    element?: JSX.Element;
  }[];
  emptyState?: {
    isSearching?: boolean;
    noData?: TableEmptyScreenProps;
    noSearchResults?: TableEmptyScreenProps;
    customStyles?: { row?: SxProps<Theme>; cell?: SxProps<Theme> };
  };
}

const TableBodyEmptyState: FC<TableBodyEmptyStateProps> = ({
  headers,
  emptyState
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  return (
    <TableRow
      sx={mergeSx([
        classes.tableBody.emptyState.row,
        emptyState?.customStyles?.row
      ])}
    >
      <TableCell
        colSpan={headers?.length + 2}
        sx={mergeSx([
          classes.tableBody.emptyState.cell,
          emptyState?.customStyles?.cell
        ])}
      >
        {emptyState?.isSearching ? (
          <TableEmptyScreen
            title={emptyState?.noSearchResults?.title}
            description={emptyState?.noSearchResults?.description}
            button={emptyState?.noSearchResults?.button}
            customStyles={emptyState?.noSearchResults?.customStyles}
          />
        ) : (
          <TableEmptyScreen
            title={emptyState?.noData?.title}
            description={emptyState?.noData?.description}
            button={emptyState?.noData?.button}
            customStyles={emptyState?.noData?.customStyles}
          />
        )}
      </TableCell>
    </TableRow>
  );
};

export default TableBodyEmptyState;
