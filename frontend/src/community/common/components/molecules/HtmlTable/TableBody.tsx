import { Theme, useTheme } from "@mui/material";
import { FC } from "react";

import { CommonTableProps } from "./Table";
import TableDataCell from "./TableDataCell";

const TableBody: FC<CommonTableProps> = ({ headers, rows }) => {
  const theme: Theme = useTheme();

  return (
    <tbody>
      {rows?.map((row) => (
        <tr
          key={row.id}
          style={{
            height: "79px",
            background: theme.palette.grey[50]
          }}
        >
          {headers.map((header) => (
            <TableDataCell key={header.id}>
              {typeof row[header?.id] === "function"
                ? row[header?.id]()
                : row[header?.id]}
            </TableDataCell>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
