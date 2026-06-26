import { Theme } from "@mui/material/styles";

export const skeletonStyles = (theme: Theme) => ({
  outerContainer: {
    mb: "2rem"
  },
  headerContainer: {
    mt: "1rem",
    gap: "1.0625rem"
  },
  skeletonLarge: {
    borderRadius: "0.75rem",
    backgroundColor: theme.palette.grey[200],
    mr: "3%"
  },
  skeletonSmall: {
    borderRadius: "0.75rem",
    backgroundColor: theme.palette.grey[200]
  },
  rowContainer: {
    mt: "1rem",
    gap: "1.0625rem"
  },
  avatarSkeleton: {
    backgroundColor: theme.palette.grey[200]
  },
  nameSkeleton: {
    borderRadius: "0.75rem",
    backgroundColor: theme.palette.grey[200]
  },
  valueSkeleton: {
    borderRadius: "0.75rem",
    backgroundColor: theme.palette.grey[200]
  }
});
