import { FC } from "react";

import { CommonTableProps } from "./Table";
import TableRows from "./TableRows";
import TableSkeleton, { TableSkeletonProps } from "./TableSkeleton";

const TableBody: FC<TableSkeletonProps & CommonTableProps> = ({
  loadingState,
  headers,
  rows
}) => {
  return (
    <tbody style={{ height: "100%", maxHeight: "24.6875rem" }}>
      {loadingState && loadingState.isLoading ? (
        <TableSkeleton loadingState={loadingState} />
      ) : (
        <TableRows headers={headers} rows={rows} />
      )}
    </tbody>
  );
};

export default TableBody;
