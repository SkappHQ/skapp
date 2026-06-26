import { Box, Skeleton, Stack, SxProps, Theme, useTheme } from "@mui/material";
import { JSX } from "react";

import CircularProgressSkeleton from "../CircularProgressSkeleton/CircularProgressSkeleton";

interface Props {
  isBoundary?: boolean;
  style?: SxProps;
  isIndividual?: boolean;
  isProgressCircle?: boolean;
}

const AnalyticCardSkeleton = ({
  style,
  isBoundary,
  isIndividual,
  isProgressCircle
}: Props): JSX.Element => {
  const theme: Theme = useTheme();

  const stripWidth = isIndividual ? "8.063rem" : "7.063rem";
  return (
    <Box
      sx={{
        backgroundColor: isBoundary ? theme.palette.grey[100] : "none",
        flexGrow: 1,
        flexBasis: { xs: "100%", sm: "50%", md: "25%" },
        height: "8rem",
        display: "flex",
        alignItems: "center",
        borderRadius: "0.75rem",
        position: "relative",
        maxWidth: "18rem",
        ...style
      }}
    >
      <Stack direction={"column"} gap={"0.375rem"} sx={{ ml: "1.25rem" }}>
        <Stack direction={"row"} justifyContent={"flex-start"}>
          <Skeleton
            variant="rounded"
            height="0.938rem"
            sx={{
              borderRadius: "0.75rem",
              backgroundColor: theme.palette.grey[200],
              mr: "0.688rem"
            }}
            width="0.938rem"
            animation={"wave"}
          />
          <Skeleton
            variant="rounded"
            height="0.875rem"
            sx={{
              borderRadius: "0.75rem",
              backgroundColor: theme.palette.grey[200]
            }}
            width={stripWidth}
            animation={"wave"}
          />
        </Stack>
        <Stack direction={"row"} justifyContent={"flex-start"}>
          <Skeleton
            variant="rounded"
            height="0.938rem"
            sx={{
              borderRadius: "0.75rem",
              backgroundColor: theme.palette.grey[200],
              mr: "0.688rem"
            }}
            width="0.938rem"
            animation={"wave"}
          />
          <Skeleton
            variant="rounded"
            height="0.875rem"
            sx={{
              borderRadius: "0.75rem",
              backgroundColor: theme.palette.grey[200]
            }}
            width={stripWidth}
            animation={"wave"}
          />
        </Stack>
        <Stack direction={"row"} justifyContent={"flex-start"}>
          <Skeleton
            variant="rounded"
            height="0.938rem"
            sx={{
              borderRadius: "0.75rem",
              backgroundColor: theme.palette.grey[200],
              mr: "0.688rem"
            }}
            width="0.938rem"
            animation={"wave"}
          />
          <Skeleton
            variant="rounded"
            height="0.875rem"
            sx={{
              borderRadius: "0.75rem",
              backgroundColor: theme.palette.grey[200]
            }}
            width={stripWidth}
            animation={"wave"}
          />
        </Stack>
        <Stack direction={"row"} justifyContent={"flex-start"}>
          <Skeleton
            variant="rounded"
            height="0.938rem"
            sx={{
              borderRadius: "0.75rem",
              backgroundColor: theme.palette.grey[200],
              mr: "0.688rem"
            }}
            width="0.938rem"
            animation={"wave"}
          />
          <Skeleton
            variant="rounded"
            height="0.875rem"
            sx={{
              borderRadius: "0.75rem",
              backgroundColor: theme.palette.grey[200]
            }}
            width={stripWidth}
            animation={"wave"}
          />
        </Stack>
      </Stack>
      {isProgressCircle && (
        <Box
          sx={{
            position: "absolute",
            bottom: "1.25rem",
            right: "0.5rem"
          }}
        >
          <CircularProgressSkeleton />
        </Box>
      )}
    </Box>
  );
};

export default AnalyticCardSkeleton;
