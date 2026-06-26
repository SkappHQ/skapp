import { Box, Skeleton, Stack } from "@mui/material";
import { type SxProps, type Theme, useTheme } from "@mui/material/styles";
import { JSX } from "react";

interface Props {
  styles?: SxProps;
}

const AnalyticGraphSkeleton = ({ styles }: Props): JSX.Element => {
  const theme: Theme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.grey[100],
        width: "100%",
        height: "230px",
        borderRadius: "12px",
        pt: "12px",
        pl: "12px",
        pr: "12px",
        ...styles
      }}
    >
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Skeleton
          variant="rounded"
          height="23px"
          sx={{
            borderRadius: "12px",
            backgroundColor: theme.palette.grey[200]
          }}
          width="240px"
          animation={"wave"}
        />
        <Stack
          height="32px"
          sx={{
            borderRadius: "12px",
            backgroundColor: theme.palette.grey[200]
          }}
          direction={"row"}
          width="288px"
          justifyContent={"space-evenly"}
          alignItems={"center"}
        >
          <Skeleton
            variant="rounded"
            height="24px"
            sx={{
              borderRadius: "12px",
              backgroundColor: theme.palette.grey[100]
            }}
            width="65px"
            animation={"wave"}
          />
          <Skeleton
            variant="rounded"
            height="24px"
            sx={{
              borderRadius: "12px",
              backgroundColor: theme.palette.grey[100]
            }}
            width="65px"
            animation={"wave"}
          />
          <Skeleton
            variant="rounded"
            height="24px"
            sx={{
              borderRadius: "12px",
              backgroundColor: theme.palette.grey[100]
            }}
            width="65px"
            animation={"wave"}
          />
          <Skeleton
            variant="rounded"
            height="24px"
            sx={{
              borderRadius: "12px",
              backgroundColor: theme.palette.grey[100]
            }}
            width="65px"
            animation={"wave"}
          />
        </Stack>
      </Stack>
      <Stack direction={"column"} gap={"20px"} sx={{ ml: "5px", mt: "30px" }}>
        <Stack direction={"row"} justifyContent={"flex-start"}>
          <Skeleton
            variant="rounded"
            height="15px"
            sx={{
              borderRadius: "12px",
              backgroundColor: theme.palette.grey[200],
              mr: "11px"
            }}
            width="15px"
            animation={"wave"}
          />
          <Skeleton
            variant="rounded"
            height="14px"
            sx={{
              borderRadius: "12px",
              backgroundColor: theme.palette.grey[200]
            }}
            width="100%"
            animation={"wave"}
          />
        </Stack>
        <Stack direction={"row"} justifyContent={"flex-start"}>
          <Skeleton
            variant="rounded"
            height="15px"
            sx={{
              borderRadius: "12px",
              backgroundColor: theme.palette.grey[200],
              mr: "11px"
            }}
            width="15px"
            animation={"wave"}
          />
          <Skeleton
            variant="rounded"
            height="14px"
            sx={{
              borderRadius: "12px",
              backgroundColor: theme.palette.grey[200]
            }}
            width="100%"
            animation={"wave"}
          />
        </Stack>
        <Stack direction={"row"} justifyContent={"flex-start"}>
          <Skeleton
            variant="rounded"
            height="15px"
            sx={{
              borderRadius: "12px",
              backgroundColor: theme.palette.grey[200],
              mr: "11px"
            }}
            width="15px"
            animation={"wave"}
          />
          <Skeleton
            variant="rounded"
            height="14px"
            sx={{
              borderRadius: "12px",
              backgroundColor: theme.palette.grey[200]
            }}
            width="100%"
            animation={"wave"}
          />
        </Stack>
        <Stack direction={"row"} justifyContent={"flex-start"}>
          <Skeleton
            variant="rounded"
            height="15px"
            sx={{
              borderRadius: "12px",
              backgroundColor: theme.palette.grey[200],
              mr: "11px"
            }}
            width="15px"
            animation={"wave"}
          />
          <Skeleton
            variant="rounded"
            height="14px"
            sx={{
              borderRadius: "12px",
              backgroundColor: theme.palette.grey[200]
            }}
            width="100%"
            animation={"wave"}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

export default AnalyticGraphSkeleton;
