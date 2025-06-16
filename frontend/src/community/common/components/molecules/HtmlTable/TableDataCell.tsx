import { CSSProperties, ReactNode } from "react";

interface TableDataCellProps {
  children: ReactNode;
  colSpan?: number;
  style?: CSSProperties;
}

const TableDataCell = ({
  children,
  colSpan = 1,
  style
}: TableDataCellProps) => {
  return (
    <td
      style={{
        padding: "8px 16px",
        fontSize: "14px",
        lineHeight: "21px",
        color: "#333",
        borderBottom: "1px solid #e0e0e0",
        ...style
      }}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
};

export default TableDataCell;
