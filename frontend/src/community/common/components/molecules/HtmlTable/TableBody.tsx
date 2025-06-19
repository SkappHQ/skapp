import { Theme, useTheme } from "@mui/material";
import { CSSProperties, FC } from "react";

import { CommonTableProps } from "./Table";
import TableDataCell from "./TableDataCell";

export interface TableBodyProps {
  loadingState?: {
    skeleton?: {
      rows?: number;
    };
    customStyles?: { row?: CSSProperties; cell?: CSSProperties };
  };
}

const TableBody: FC<TableBodyProps & CommonTableProps> = ({
  loadingState,
  headers,
  rows
}) => {
  const theme: Theme = useTheme();

  return (
    <tbody style={{ height: "100%", maxHeight: "395px" }}>
      {rows?.map((row) => (
        <tr
          key={row.id}
          style={{
            height: "79px",
            maxHeight: "79px",
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
      ))}
    </tbody>
  );
};

export default TableBody;
