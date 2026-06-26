import { Box, Skeleton } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { Stack } from "@mui/system";
import { FC } from "react";

import { skeletonStyles } from "./styles";

const TimesheetAnalyticsSkeleton: FC = () => {
  const theme: Theme = useTheme();
  const styles = skeletonStyles(theme);

  return (
    <Stack
      flexDirection="column"
      justifyContent="space-between"
      gap="1.0625rem"
      sx={styles.outerContainer}
    >
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        gap="1.0625rem"
        sx={styles.headerContainer}
        alignItems={"center"}
      >
        <Skeleton
          variant="rectangular"
          height="1.5rem"
          sx={styles.skeletonLarge}
          width="15rem"
          animation={"wave"}
        />
        {[...Array(7)].map((_, index) => (
          <Skeleton
            animation={"wave"}
            sx={styles.skeletonSmall}
            variant="rectangular"
            width="3.75rem"
            height="1.125rem"
            key={index}
          />
        ))}
      </Stack>
      <Box sx={{ overflow: "hidden" }}>
        {[...Array(6)].map((_, index) => (
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            gap="1.0625rem"
            sx={styles.rowContainer}
            key={index}
            alignItems={"center"}
          >
            <Stack
              flexDirection={"row"}
              justifyContent={"flex-start"}
              alignItems={"center"}
              gap={"0.4rem"}
              mr={"5rem"}
            >
              <Skeleton
                variant="rectangular"
                height="1.8rem"
                sx={styles.avatarSkeleton}
                width="1.8rem"
                animation={"wave"}
              />
              <Skeleton
                variant="rectangular"
                height="1rem"
                sx={styles.nameSkeleton}
                width="9.5rem"
                animation={"wave"}
              />
            </Stack>
            {[...Array(7)].map((_, index) => (
              <Stack
                key={index}
                sx={{
                  width: "3.75rem"
                }}
                justifyContent={"center"}
                flexDirection={"row"}
                gap={"0.3rem"}
              >
                {index === 2 && (
                  <Skeleton
                    animation={"wave"}
                    sx={styles.valueSkeleton}
                    variant="rectangular"
                    width={"1.125rem"}
                    height="1.125rem"
                  />
                )}
                <Skeleton
                  animation={"wave"}
                  sx={styles.valueSkeleton}
                  variant="rectangular"
                  width={
                    index === 5 || index === 6
                      ? "0.5rem"
                      : index === 2
                        ? "2.5rem"
                        : "3.75rem"
                  }
                  height="1.125rem"
                />
              </Stack>
            ))}
          </Stack>
        ))}
      </Box>
    </Stack>
  );
};

export default TimesheetAnalyticsSkeleton;
