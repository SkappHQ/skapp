import { FC } from "react";

import { TableNames } from "~community/common/enums/Table";
import { HTMLTableHeaderTypes } from "~community/common/types/CommonTypes";
import { HolidayDurationType } from "~community/people/types/HolidayTypes";

import TableActionToolbar, {
  TableHeadActionRowProps
} from "./TableActionToolbar";
import TableBody from "./TableBody";
import TableFoot, { TableFootProps } from "./TableFoot";
import TableHead from "./TableHead";

interface Props {
  actionToolbar?: TableHeadActionRowProps;
  tableFoot?: TableFootProps;
}

export interface CommonTableProps {
  tableName?: TableNames;
  headers: HTMLTableHeaderTypes[];
  rows?: any[];
}

const Table: FC<Props & CommonTableProps> = ({
  actionToolbar,
  headers,
  rows,
  tableFoot,
  tableName
}) => {
  return (
    <div
      aria-label={`${tableName} table`}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
        borderRadius: "8px",
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
          <TableHead headers={headers} rows={rows} />
          <TableBody headers={headers} rows={rows} />
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
