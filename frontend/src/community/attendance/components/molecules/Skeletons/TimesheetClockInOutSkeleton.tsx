import { Box, Skeleton } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { Stack } from "@mui/system";
import { FC } from "react";

interface Props {
  skeletonAnimation?: false | "pulse" | "wave";
}
const TimesheetClockInOutSkeleton: FC<Props> = ({
  skeletonAnimation = "wave"
}) => {
  const theme: Theme = useTheme();
  return (
    <Box
      sx={{
        mb: "2rem",
        width: "100%",
        height: "100%",
        flex: 1
      }}
    >
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        gap="1.0625rem"
        sx={{ mt: "2rem", mx: "1rem" }}
      >
        <Stack
          flexDirection="column"
          justifyContent="flex-start"
          gap="1.0625rem"
          alignItems={"center"}
        >
          {[...Array(5)].map((_, index) => (
            <Skeleton
              key={index}
              animation={skeletonAnimation}
              sx={{
                borderRadius: "0.75rem",
                backgroundColor: theme.palette.grey[200]
              }}
              variant="rectangular"
              width={"1.125rem"}
              height="1.125rem"
            />
          ))}
        </Stack>
        <Stack
          flexDirection="column"
          justifyContent="space-between"
          gap="0.5rem"
          alignItems={"center"}
          width="100%"
        >
          <Skeleton
            variant="rectangular"
            height="10rem"
            sx={{
              borderRadius: "0.55rem",
              backgroundColor: theme.palette.grey[200]
            }}
            width="100%"
            animation={skeletonAnimation}
          />
          <Stack
            flexDirection="row"
            justifyContent="space-evenly"
            gap="1.0625rem"
            alignItems={"center"}
            width="100%"
          >
            {[...Array(5)].map((_, index) => (
              <Stack
                key={index}
                flexDirection="column"
                gap="0.5rem"
                alignItems={"center"}
                width="100%"
              >
                <Skeleton
                  animation={skeletonAnimation}
                  sx={{
                    borderRadius: "0.75rem",
                    backgroundColor: theme.palette.grey[200]
                  }}
                  variant="rectangular"
                  width={"3.5rem"}
                  height="1rem"
                />
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TimesheetClockInOutSkeleton;
