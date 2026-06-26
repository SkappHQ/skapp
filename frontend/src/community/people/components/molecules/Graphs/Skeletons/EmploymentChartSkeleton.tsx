import { Box, Skeleton } from "@mui/material";
import { Stack } from "@mui/system";
import { FC } from "react";

interface Props {
  skeletonAnimation?: false | "pulse" | "wave";
}

const EmploymentChartSkeleton: FC<Props> = ({ skeletonAnimation = "wave" }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: { xs: "1rem", sm: "1.5rem", md: "2rem" }
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "10rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          mt: "1rem"
        }}
      >
        {[...Array(3)].map((_, index) => (
          <Skeleton
            key={index}
            animation={skeletonAnimation}
            variant="rectangular"
            width={`${(index + 1) * 30}%`}
            height="3rem"
            sx={{
              borderRadius: "0.25rem"
            }}
          />
        ))}
      </Box>

      <Stack
        direction="row"
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

export default EmploymentChartSkeleton;
