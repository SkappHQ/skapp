import { Box, Skeleton } from "@mui/material";
import { FC } from "react";

interface Props {
  rows: number;
  height?: number;
}
const TableSkeleton: FC<Props> = ({ rows, height }) => {
  return (
    <Box sx={{ width: "100%" }}>
      {Array(rows)
        .fill(null)
        .map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width="100%"
            height={height ?? 66.5}
            sx={{ my: 1 }}
            animation="wave"
          />
        ))}
    </Box>
  );
};
export default TableSkeleton;
