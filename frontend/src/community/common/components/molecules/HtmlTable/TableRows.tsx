import { Theme, useTheme } from "@mui/material";
import { FC } from "react";

import { CommonTableProps } from "./Table";
import TableDataCell from "./TableDataCell";

const TableRows: FC<CommonTableProps> = ({ headers, rows }) => {
  const theme: Theme = useTheme();

  return rows?.map((row) => (
    <tr
      key={row.id}
      style={{
        height: "4.9375rem",
        maxHeight: "4.9375rem",
        background: theme.palette.grey[50]
      }}
    >
      {headers.map((header) => {
        const hasSubtitle = header?.subtitle?.duration !== undefined;

        return (
          <TableDataCell
            scope="row"
            key={header.id}
            className={header.sticky ? "sticky-col" : ""}
            style={{
              backgroundColor: hasSubtitle ? theme.palette.grey[100] : ""
            }}
          >
            {typeof row[header?.id] === "function"
              ? row[header?.id]()
              : row[header?.id]}
          </TableDataCell>
        );
      })}
    </tr>
  ));
};

export default TableRows;
