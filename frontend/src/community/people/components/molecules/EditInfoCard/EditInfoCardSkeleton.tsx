import { Skeleton, Stack, useTheme } from "@mui/material";

import { useScreenSizeRange } from "~community/common/hooks/useScreenSizeRange";

const EditInfoCardSkeleton = () => {
  const theme = useTheme();
  const { isTabScreen, isPhoneScreen, isSmallPhoneScreen } =
    useScreenSizeRange();

  const isColumnLayout = isTabScreen || isPhoneScreen || isSmallPhoneScreen;

  return (
    <Stack
      sx={{
        mb: "2rem",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        background: theme.palette.grey[50],
        padding: "1.5rem 1rem",
        borderRadius: "0.75rem",
        gap: "1rem"
      }}
    >
      <Stack direction="row" gap="1rem" sx={{ alignItems: "center" }}>
        <Skeleton variant="circular" width={98} height={98} />
        <Stack direction="column" alignItems="flex-start" gap="1rem">
          <Stack direction="column" alignItems="flex-start" gap="0.125rem">
            <Skeleton variant="text" width={200} height={30} />
            <Skeleton variant="text" width={150} height={20} />
          </Stack>

          <Stack direction={isColumnLayout ? "column" : "row"} gap="0.5rem">
            <Stack direction="row" gap="0.5rem">
              <Skeleton variant="rectangular" width={24} height={24} />
              <Skeleton variant="text" width={120} height={20} />
            </Stack>
            <Stack direction="row" gap="0.5rem">
              <Skeleton variant="rectangular" width={24} height={24} />
              <Skeleton variant="text" width={120} height={20} />
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      <Stack direction="row" gap="2.25rem">
        <Stack direction="column" alignItems="flex-start" gap="1rem">
          <Skeleton variant="text" width={100} height={20} />
          <Stack direction="row" gap="0.625rem" alignItems="center">
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="rectangular" width={50} height={20} />
          </Stack>
        </Stack>
        <Stack direction="column" justifyContent="space-between" gap="1rem">
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="rectangular" width={80} height={20} />
          <Skeleton variant="text" width={150} height={20} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default EditInfoCardSkeleton;
