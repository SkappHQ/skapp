import { Grid2, Skeleton } from "@mui/material";

import { ALLOCATION_PER_PAGE } from "~community/leave/constants/stringConstants";

const LeaveAllocationSkeleton = () => {
  let skeletonCards = [];

  for (let item = 0; item < ALLOCATION_PER_PAGE; item++) {
    skeletonCards.push(
      <Grid2 key={item} size={{ xs: 6, md: 4 }}>
        <Skeleton
          variant="rounded"
          height="7.5rem"
          animation="wave"
          key={item}
        />
      </Grid2>
    );
  }

  return skeletonCards;
};

export default LeaveAllocationSkeleton;
