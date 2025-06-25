import { Theme, useTheme } from "@mui/material";
import { ReactNode } from "react";

interface TableHeadCellProps {
  children: ReactNode;
  scope?: "col" | "row" | "colgroup" | "rowgroup";
  ariaLabel?: string;
  className?: string;
}

const TableHeadCell = ({
  children,
  scope,
  className,
  ariaLabel = ""
}: TableHeadCellProps) => {
  const theme: Theme = useTheme();

  return (
    <th
      className={className}
      style={{
        color: theme.palette.text.secondary,
        fontWeight: 400,
        fontSize: "14px",
        lineHeight: "21px",
        padding: "12px 16px",
        minWidth: "100px",
        height: "48px",
        textAlign: "center"
      }}
      scope={scope}
      aria-label={ariaLabel}
    >
      {children}
    </th>
  );
};

export default TableHeadCell;
