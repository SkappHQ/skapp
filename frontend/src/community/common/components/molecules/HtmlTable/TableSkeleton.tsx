import { Skeleton } from "@mui/material";
import React from "react";
import { CSSProperties, FC } from "react";

export interface TableSkeletonProps {
  loadingState?: {
    isLoading?: boolean;
    skeleton?: {
      rows?: number;
    };
  };
}

const TableSkeleton: FC<TableSkeletonProps> = ({ loadingState }) => {
  return (
    <div
      style={{
        width: "100%"
      }}
    >
      {Array(loadingState?.skeleton?.rows ?? 5)
        .fill(null)
        .map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width="100%"
            height={66.5}
            sx={{ my: 1 }}
            animation="wave"
          />
        ))}
    </div>
  );
};

export default TableSkeleton;
