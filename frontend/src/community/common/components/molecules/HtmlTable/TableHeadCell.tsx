import { Theme, useTheme } from "@mui/material";
import { ReactNode } from "react";

interface TableHeadCellProps {
  children: ReactNode;
  scope?: "col" | "row" | "colgroup" | "rowgroup";
}

const TableHeadCell = ({ children, scope }: TableHeadCellProps) => {
  const theme: Theme = useTheme();

  return (
    <th
      style={{
        color: theme.palette.text.secondary,
        fontWeight: 400,
        fontSize: "14px",
        lineHeight: "21px",
        padding: "8px 16px",
        height: "48px",
        textAlign: "left"
      }}
      scope={scope}
    >
      {children}
    </th>
  );
};

export default TableHeadCell;
