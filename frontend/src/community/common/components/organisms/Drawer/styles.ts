import { Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

type stylesProps = {
  theme: Theme;
};

export const DRAWER_ANIMATION_DURATION = "0.3s";
export const DRAWER_TRANSFORM_DURATION = "0.05s";

export const styles = ({ theme }: stylesProps) => ({
  iconBtn: (isDrawerExpanded: boolean) => ({
    display: { xs: "flex", sm: "none", lg: "flex" },
    position: "absolute",
    top: { xs: "2.5rem", lg: "2.65rem" },
    right: { xs: "2.25rem", lg: isDrawerExpanded ? "1.5rem" : "0.25rem" },
    height: "2.5rem",
    width: "2.5rem",
    zIndex: ZIndexEnums.MODAL,
    visibility: {
      xs: "visible",
      lg: isDrawerExpanded ? "hidden" : "visible"
    },
    transition: `right ${DRAWER_ANIMATION_DURATION} ease, opacity ${DRAWER_ANIMATION_DURATION} ease, visibility ${DRAWER_ANIMATION_DURATION} ease, transform ${DRAWER_TRANSFORM_DURATION} ease`
  }),
  iconToggleBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  iconToggle: (isVisible: boolean) => ({
    position: "absolute",
    display: "flex",
    transition: `opacity ${DRAWER_ANIMATION_DURATION} ease`,
    opacity: isVisible ? 1 : 0,
    zIndex: isVisible ? 2 : 1
  }),
  drawerContainer: (isDrawerExpanded: boolean) => ({
    width: "100%",
    height: "100%",
    padding: "2.5rem 0rem 2.5rem 2rem",
    boxSizing: "border-box",
    transition: `opacity ${DRAWER_ANIMATION_DURATION} ease, visibility ${DRAWER_ANIMATION_DURATION} ease`,
    opacity: isDrawerExpanded ? 1 : 0,
    visibility: isDrawerExpanded ? "visible" : "hidden"
  }),
  imageWrapper: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "8.75rem",
    marginBottom: "0.75rem"
  },

  logoImage: {
    display: "flex",
    width: "100%",
    height: "auto",
    maxWidth: "10rem",
    maxHeight: "3.25rem",
    objectFit: "contain" as const,
    cursor: "pointer"
  },
  list: {
    display: "flex",
    flexDirection: "column",
    height: "auto",
    width: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    scrollbarWidth: "thin",
    gap: "1rem",
    paddingTop: "1.25rem",
    transition: `all ${DRAWER_ANIMATION_DURATION} ease`
  },
  listItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    transition: `all ${DRAWER_ANIMATION_DURATION} ease-in-out`,
    transformOrigin: "top"
  },
  listItemButton: (isSelected: boolean) => ({
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "calc(100% - 2rem)",
    gap: "1rem",
    padding: "0.75rem 1rem",
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
    width: "100%",
    overflow: "hidden",
    transition: `all ${DRAWER_ANIMATION_DURATION} ease-in-out`
  },
  subList: {
    display: "flex",
    flexDirection: "column",
    height: "auto",
    width: "calc(100% - 1rem)",
    gap: "0.25rem",
    padding: "0.25rem 0rem 0rem 0rem",
    transition: `all ${DRAWER_ANIMATION_DURATION} ease-in-out`
  },
  subListItem: {
    padding: "0rem",
    transition: `all ${DRAWER_ANIMATION_DURATION} ease-in-out`,
    transformOrigin: "top"
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
    transition: `transform ${DRAWER_ANIMATION_DURATION} ease`,
    visibility: hasSubTree ? "visible" : "hidden",
    transform:
      expandedDrawerListItem === currentDrawerListItem ? "rotate(180deg)" : ""
  }),
  footer: {
    width: "calc(100% - 2rem)",
    marginTop: "auto",
    paddingTop: "1.25rem",
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  applyLeaveBtn: {
    display: { xs: "none", sm: "flex" },
    flexDirection: "row"
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
  itemUrl: string | null
) => {
  if (itemUrl === null) {
    return theme.palette.common.black;
  }

  const isSelected = currentPageUrl.includes(itemUrl);

  if (isSelected) {
    return theme.palette.primary.dark;
  } else {
    return theme.palette.common.black;
  }
};
