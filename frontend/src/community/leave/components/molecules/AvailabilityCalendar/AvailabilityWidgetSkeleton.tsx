import { Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { FC } from "react";

interface Props {
  skeletonAnimation?: false | "pulse" | "wave";
  itemsLength?: number;
}

const AvailabilityWidgetSkeleton: FC<Props> = ({
  skeletonAnimation = "wave",
  itemsLength = 14
}) => {
  return (
    <Grid container spacing={2} sx={{ padding: "1rem" }}>
      {[...Array(itemsLength)].map((_, index) => (
        <Grid
          size={12 / 7}
          key={index}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            padding: "1rem",
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: "0.5rem",
            backgroundColor: "grey.100"
          }}
        >
          {/* Date Placeholder */}
          <Skeleton
            animation={skeletonAnimation}
            variant="text"
            width="5rem"
            height="1rem"
          />
          <Skeleton
            animation={skeletonAnimation}
            variant="text"
            width="3rem"
            height="0.75rem"
          />

          {/* Status Placeholder */}
          <Skeleton
            animation={skeletonAnimation}
            variant="rectangular"
            width="5rem"
            height="1.5rem"
            sx={{ borderRadius: "0.25rem" }}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default AvailabilityWidgetSkeleton;
