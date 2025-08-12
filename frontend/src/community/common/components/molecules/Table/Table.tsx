import {
  Table as MuiTable,
  Stack,
  SxProps,
  TableContainer,
  Theme,
  useTheme
} from "@mui/material";
import { FC, RefObject } from "react";

import {
  TableHeaderTypes,
  TableTypes
} from "~community/common/types/CommonTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import TableBody, { TableBodyProps } from "./TableBody";
import TableFoot, { TableFootProps } from "./TableFoot";
import TableHead, { TableHeadProps } from "./TableHead";
import TableHeadActionToolbar, {
  TableHeadActionRowProps
} from "./TableHeadActionToolbar";
import styles from "./styles";

interface Props {
  actionToolbar?: TableHeadActionRowProps;
  tableHead?: TableHeadProps;
  tableBody?: TableBodyProps;
  tableFoot?: TableFootProps;
  customStyles?: {
    wrapper?: SxProps<Theme>;
    container?: SxProps<Theme>;
    table?: SxProps<Theme>;
  };
  tableContainerRef?: RefObject<HTMLDivElement>;
}

export interface TableProps {
  tableName: string;
}

export interface CommonTableProps {
  isLoading?: boolean;
  headers: TableHeaderTypes[];
  rows: any[];
  isRowDisabled?: (row: any) => boolean;
  selectedRows?: number[];
  checkboxSelection?: {
    //NOTE: If you want to disable individual checkbox, you have to use isRowDisabled prop and disable the entire row
    isEnabled?: boolean;
    isSelectAllEnabled?: boolean;
    isSelectAllVisible?: boolean;
    isSelectAllChecked?: boolean;
    handleIndividualSelectClick?: (id: number) => () => void;
    handleSelectAllClick?: () => void;
    customStyles?: { cell?: SxProps<Theme>; checkbox?: SxProps<Theme> };
  };
}

const Table: FC<Props & CommonTableProps & TableProps & TableTypes> = ({
  tableName,
  isLoading,
  headers,
  rows,
  isRowDisabled,
  selectedRows,
  checkboxSelection = {
    isEnabled: false,
    isSelectAllEnabled: false,
    isSelectAllVisible: false,
    isSelectAllChecked: false,
    handleIndividualSelectClick: () => () => {},
    handleSelectAllClick: () => {},
    customStyles: {
      cell: {},
      checkbox: {}
    }
  },
  actionToolbar,
  tableHead,
  tableBody,
  tableFoot,
  customStyles,
  tableContainerRef
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  return (
    <Stack sx={mergeSx([classes.wrapper, customStyles?.wrapper])}>
      <TableHeadActionToolbar
        firstRow={actionToolbar?.firstRow}
        secondRow={actionToolbar?.secondRow}
        customStyles={actionToolbar?.customStyles}
      />

      <TableContainer
        ref={tableContainerRef}
        sx={mergeSx([classes.container, customStyles?.container])}
      >
        <MuiTable
          stickyHeader
          sx={mergeSx([classes.table, customStyles?.table])}
        >
          <caption
            style={{
              position: "absolute",
              width: "0.0625rem",
              height: "0.0625rem",
              padding: 0,
              margin: "-0.0625rem",
              overflow: "hidden",
              clip: "rect(0, 0, 0, 0)",
              whiteSpace: "nowrap",
              border: 0
            }}
            tabIndex={0}
          >
            {tableName}
          </caption>
          <TableHead
            headers={headers}
            rows={rows}
            checkboxSelection={checkboxSelection}
            actionColumn={{
              isEnabled:
                tableBody?.actionColumn?.actionBtns?.left !== undefined ||
                tableBody?.actionColumn?.actionBtns?.right !== undefined
            }}
            customStyles={tableHead?.customStyles}
          />
          <TableBody
            isLoading={isLoading}
            headers={headers}
            rows={rows}
            checkboxSelection={checkboxSelection}
            selectedRows={selectedRows}
            isRowDisabled={isRowDisabled}
            actionColumn={tableBody?.actionColumn}
            emptyState={tableBody?.emptyState}
            loadingState={tableBody?.loadingState}
            customStyles={tableBody?.customStyles}
            onRowClick={tableBody?.onRowClick}
          />
        </MuiTable>
      </TableContainer>

      <TableFoot
        tableName={tableName}
        customStyles={tableFoot?.customStyles}
        pagination={tableFoot?.pagination}
        exportBtn={tableFoot?.exportBtn}
        customElements={tableFoot?.customElements}
      />
    </Stack>
  );
};

export default Table;
