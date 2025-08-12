import { FC } from "react";

import { TableNames } from "~community/common/enums/Table";
import { HTMLTableHeaderTypes } from "~community/common/types/CommonTypes";

import TableActionToolbar, {
  TableHeadActionRowProps
} from "./TableActionToolbar";
import TableBody from "./TableBody";
import TableFoot, { TableFootProps } from "./TableFoot";
import TableHead from "./TableHead";
import { TableSkeletonProps } from "./TableSkeleton";

interface Props {
  actionToolbar?: TableHeadActionRowProps;
  tableFoot?: TableFootProps;
}

export interface CommonTableProps {
  tableName?: TableNames;
  headers: HTMLTableHeaderTypes[];
  rows?: any[];
}

const Table: FC<Props & CommonTableProps & TableSkeletonProps> = ({
  loadingState,
  actionToolbar,
  headers,
  rows,
  tableFoot,
  tableName
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
        borderRadius: "0.5rem",
        overflow: "hidden"
      }}
    >
      <TableActionToolbar
        firstRow={actionToolbar?.firstRow}
        secondRow={actionToolbar?.secondRow}
        customStyles={actionToolbar?.customStyles}
      />
      <div
        className="table-container"
        role="region"
        style={{
          height: "100%",
          maxHeight: "463px"
        }}
      >
        <table
          className="sticky-table"
          style={{
            height: "100%"
          }}
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
            aria-label={`${tableName}`}
          />
          <TableHead headers={headers} rows={rows} />
          <TableBody
            loadingState={loadingState}
            headers={headers}
            rows={rows}
          />
        </table>
      </div>
      <TableFoot
        headers={headers}
        customStyles={tableFoot?.customStyles}
        pagination={tableFoot?.pagination}
        exportBtn={tableFoot?.exportBtn}
        customElements={tableFoot?.customElements}
      />
    </div>
  );
};

export default Table;
