import { CSSProperties, ReactNode } from "react";

interface TableDataCellProps {
  children: ReactNode;
  colSpan?: number;
  style?: CSSProperties;
  scope?: "row" | "col" | "colgroup" | "rowgroup";
  className?: string;
}

const TableDataCell = ({
  children,
  colSpan = 1,
  style,
  scope = "row",
  className
}: TableDataCellProps) => {
  return (
    <td
      style={{
        padding: "8px 16px",
        fontSize: "14px",
        lineHeight: "21px",
        color: "#333",
        minWidth: "100px",
        textAlign: "center",
        borderBottom: "1px solid #e0e0e0",
        ...style
      }}
      colSpan={colSpan}
      scope={scope}
      className={className}
    >
      {children}
    </td>
  );
};

export default TableDataCell;
