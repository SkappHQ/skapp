import { Theme, useTheme } from "@mui/material";
import { FC } from "react";

import { CommonTableProps } from "./Table";
import TableHeadCell from "./TableHeadCell";

const TableHead: FC<CommonTableProps> = ({ headers, rows }) => {
  const theme: Theme = useTheme();

  return (
    <thead
      style={{
        backgroundColor: theme.palette.grey[100]
      }}
    >
      <tr>
        {headers.map((header) => (
          <TableHeadCell key={header.id} scope="col">
            {header.label}
          </TableHeadCell>
        ))}
      </tr>
    </thead>
  );
};

export default TableHead;
