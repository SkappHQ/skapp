import { FC } from "react";

import { TableHeaderTypes } from "~community/common/types/CommonTypes";

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
  headers: TableHeaderTypes[];
  rows?: any[];
}

const Table: FC<Props & CommonTableProps> = ({
  actionToolbar,
  headers,
  rows,
  tableFoot
}) => {
  return (
    <div style={{ width: "100%", borderRadius: "12px", overflow: "hidden" }}>
      <TableActionToolbar
        firstRow={actionToolbar?.firstRow}
        secondRow={actionToolbar?.secondRow}
        customStyles={actionToolbar?.customStyles}
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <TableHead headers={headers} rows={rows} />
        <TableBody headers={headers} rows={rows} />
        <TableFoot
          headers={headers}
          customStyles={tableFoot?.customStyles}
          pagination={tableFoot?.pagination}
          exportBtn={tableFoot?.exportBtn}
          customElements={tableFoot?.customElements}
        />
      </table>
    </div>
  );
};

export default Table;
