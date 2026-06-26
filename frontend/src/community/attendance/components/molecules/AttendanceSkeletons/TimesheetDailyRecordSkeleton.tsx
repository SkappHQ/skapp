import { Skeleton, Stack } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC } from "react";

interface Props {
  skeletonAnimation?: false | "pulse" | "wave";
}

const TimesheetDailyRecordSkeleton: FC<Props> = ({
  skeletonAnimation = "wave"
}) => {
  const theme: Theme = useTheme();
  return (
    <Stack
      flexDirection="column"
      justifyContent="space-between"
      gap="1.0625rem"
    >
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        gap="1.0625rem"
        sx={{
          mt: "1rem"
        }}
      >
        <Skeleton
          animation={skeletonAnimation}
          sx={{
            borderRadius: "0.75rem",
            backgroundColor: theme.palette.grey[200],
            mr: "10%"
          }}
          variant="rectangular"
          width="3.75rem"
          height="1.125rem"
        />
        <Skeleton
          variant="rectangular"
          height="1.125rem"
          sx={{
            borderRadius: "0.75rem",
            backgroundColor: theme.palette.grey[200]
          }}
          width="9.5rem"
          animation={skeletonAnimation}
        />
        {[...Array(7)].map((_, index) => (
          <Skeleton
            key={index}
            animation={skeletonAnimation}
            sx={{
              borderRadius: "0.75rem",
              backgroundColor: theme.palette.grey[200]
            }}
            variant="rectangular"
            width="3.75rem"
            height="1.125rem"
          />
        ))}
      </Stack>
      {[...Array(5)].map((_, index) => (
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          gap="1.0625rem"
          sx={{
            mt: "1rem"
          }}
          key={index}
        >
          <Skeleton
            variant="rectangular"
            height="1.125rem"
            sx={{
              borderRadius: "0.75rem",
              backgroundColor: theme.palette.grey[200]
            }}
            width="9.5rem"
            animation={skeletonAnimation}
          />
          <Stack
            flexDirection="row"
            justifyContent="flex-start"
            sx={{ width: "8rem" }}
          >
            <Skeleton
              variant="rectangular"
              height="1.125rem"
              sx={{
                borderRadius: "0.75rem",
                backgroundColor: theme.palette.grey[200]
              }}
              width="5rem"
              animation={skeletonAnimation}
            />
            {index === 2 && (
              <Skeleton
                variant="rectangular"
                height="1.125rem"
                sx={{
                  borderRadius: "0.75rem",
                  backgroundColor: theme.palette.grey[200],
                  ml: "0.5rem"
                }}
                width="1.125rem"
                animation={skeletonAnimation}
              />
            )}
          </Stack>
          <Skeleton
            animation={skeletonAnimation}
            sx={{
              borderRadius: "0.75rem",
              backgroundColor: theme.palette.grey[200]
            }}
            variant="rectangular"
            width="35rem"
            height="1.125rem"
          />
        </Stack>
      ))}
    </Stack>
  );
};

export default TimesheetDailyRecordSkeleton;
