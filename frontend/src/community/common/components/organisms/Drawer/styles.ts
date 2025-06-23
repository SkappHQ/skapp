import { Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

type stylesProps = {
  theme: Theme;
};

export const styles = ({ theme }: stylesProps) => ({
  iconBtn: (isDrawerExpanded: boolean) => ({
    display: { xs: "flex", sm: "none", lg: "flex" },
    position: "absolute",
    top: { xs: "3.25rem", lg: isDrawerExpanded ? "2.65rem" : "1.875rem" },
    right: { xs: "2.25rem", lg: isDrawerExpanded ? "1.5rem" : "0.25rem" },
    height: "2.5rem",
    width: "2.5rem",
    zIndex: ZIndexEnums.MODAL,
    visibility: {
      xs: "visible",
      lg: isDrawerExpanded ? "hidden" : "visible"
    },
    transition: "opacity 0.3s ease, visibility 0.3s ease, transform 0.05s ease"
  }),
  drawerContainer: (isDrawerExpanded: boolean) => ({
    width: "100%",
    height: "100%",
    padding: "2.5rem 0rem 5rem 2rem",
    boxSizing: "border-box",
    transition: "opacity 0.1s ease, visibility 0.1s ease",
    opacity: isDrawerExpanded ? 1 : 0,
    visibility: isDrawerExpanded ? "visible" : "hidden"
  }),
  imageWrapper: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "calc(100% - 7rem)",
    padding: "0rem 0rem 1.875rem 0rem"
  },

  logoImage: {
    display: "flex",
    width: "100%",
    height: "auto",
    maxWidth: "10rem",
    objectFit: "contain" as const
  },
  list: {
    display: "flex",
    flexDirection: "column",
    height: "auto",
    width: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    scrollbarWidth: "thin",
    gap: "1rem"
  },
  listItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%"
  },
  listItemButton: (isSelected: boolean) => ({
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "calc(100% - 1rem)",
    gap: "1rem",
    padding: "0.75rem 1rem 0.75rem 1rem",
    transition: "none",
    borderRadius: "0.5rem",
    backgroundColor: isSelected ? theme.palette.secondary.main : "transparent",
    "&:hover": {
      backgroundColor: theme.palette.grey[100]
    }
  }),
  listItemIcon: {
    minWidth: "1.5rem"
  },
  listItemText: (color: string) => ({
    margin: "0rem",
    "& .MuiTypography-root": {
      fontSize: "1rem",
      lineHeight: "1.5rem",
      fontWeight: "400",
      color: color
    }
  }),
  listItemContent: {
    display: "flex",
    alignItems: "center",
    gap: "1rem"
  },
  collapse: {
    display: "flex",
    flexDirection: "column",
    width: "100%"
  },
  subList: {
    display: "flex",
    flexDirection: "column",
    height: "auto",
    gap: "0.25rem",
    padding: "0.25rem 0rem 0rem 0rem"
  },
  subListItem: {
    padding: "0rem"
  },
  subListItemButton: (isSelected: boolean) => ({
    display: "flex",
    flexDirection: "row",
    width: "100%",
    marginRight: "1rem",
    gap: "1rem",
    padding: "0.5rem 1rem 0.5rem 2.5rem",
    borderRadius: "0.5rem",
    backgroundColor: isSelected ? theme.palette.secondary.main : "transparent",
    "&:hover": {
      backgroundColor: theme.palette.grey[100]
    }
  }),
  subListItemText: (color: string) => ({
    "& .MuiTypography-root": {
      fontSize: "1rem",
      lineHeight: "1.5rem",
      fontWeight: "400",
      color: color
    }
  }),
  chevronIcons: (
    expandedDrawerListItem: string | null,
    currentDrawerListItem: string | null,
    hasSubTree: boolean
  ) => ({
    color: theme.palette.common.black,
    minWidth: "max-content",
    transition: "transform 0.3s ease",
    visibility: hasSubTree ? "visible" : "hidden",
    transform:
      expandedDrawerListItem === currentDrawerListItem ? "rotate(180deg)" : ""
  }),
  footer: {
    width: "12.5rem",
    marginTop: "auto",
    paddingTop: "1.25rem",
    gap: "1.5rem"
  },
  applyLeaveBtn: {
    display: { xs: "none", sm: "flex" },
    flexDirection: "row",
    padding: "1.25rem 2.085rem"
  },
  link: {
    width: "12.5rem",
    display: "flex",
    color: "inherit",
    justifyContent: "center"
  }
});

export const getSelectedDrawerItemColor = (
  theme: Theme,
  currentPageUrl: string,
  hoveredItemUrl: string | null,
  itemUrl: string | null
) => {
  if (itemUrl === null) {
    return theme.palette.common.black;
  }

  const isHovered = hoveredItemUrl === itemUrl;
  const isSelected = currentPageUrl.includes(itemUrl);

  if (isSelected) {
    return theme.palette.primary.dark;
  } else if (isHovered) {
    return theme.palette.primary.main;
  } else {
    return theme.palette.common.black;
  }
};
