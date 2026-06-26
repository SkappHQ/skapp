import { Box, Skeleton } from "@mui/material";
import { Stack } from "@mui/system";
import { FC } from "react";

interface Props {
  skeletonAnimation?: false | "pulse" | "wave";
}

const JobFamilyChartSkeleton: FC<Props> = ({ skeletonAnimation = "wave" }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        p: 5,
        gap: 10
      }}
    >
      <Skeleton
        variant="circular"
        width={200}
        height={200}
        animation={skeletonAnimation}
      />
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{ mt: "1rem" }}
      >
        {[...Array(3)].map((_, index) => (
          <Stack key={index} direction="row" alignItems="center" spacing={1}>
            <Skeleton
              animation={skeletonAnimation}
              variant="circular"
              width="1rem"
              height="1rem"
            />
            <Skeleton
              animation={skeletonAnimation}
              variant="text"
              width="4rem"
              height="1rem"
            />
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default JobFamilyChartSkeleton;
