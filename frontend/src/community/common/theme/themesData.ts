import { type PaletteOptions } from "@mui/material";

export const YELLOW_THEME: Partial<PaletteOptions> = {
  primary: {
    main: "#FBBF24", // primary-color
    dark: "#B45309" // primary-color-text
  },
  secondary: {
    main: "#FEF3C7", // primary-color-background
    dark: "#D97706" // primary-color-accent
  }
};

export const BLUE_THEME: Partial<PaletteOptions> = {
  primary: {
    main: "#93C5FD",
    dark: "#2A61A0"
  },
  secondary: {
    main: "#DBEAFE",
    dark: "#408CE4"
  }
};

export const GREEN_THEME: Partial<PaletteOptions> = {
  primary: {
    main: "#A3E635",
    dark: "#4D7C0F"
  },
  secondary: {
    main: "#ECFFC5",
    dark: "#65A30D"
  }
};

export const ORANGE_THEME: Partial<PaletteOptions> = {
  primary: {
    main: "#FDBA74",
    dark: "#C2410C"
  },
  secondary: {
    main: "#FFEDD5",
    dark: "#FF8937"
  }
};

export const PURPLE_THEME: Partial<PaletteOptions> = {
  primary: {
    main: "#D8B4FE",
    dark: "#9333EA"
  },
  secondary: {
    main: "#F3E8FF",
    dark: "#A855F7"
  }
};

export const ROSE_THEME: Partial<PaletteOptions> = {
  primary: {
    main: "#FDA4AF",
    dark: "#CA2441"
  },
  secondary: {
    main: "#FFE4E6",
    dark: "#FE6781"
  }
};

export const allThemes: Record<string, Partial<PaletteOptions>> = {
  BLUE_THEME,
  GREEN_THEME,
  ORANGE_THEME,
  PURPLE_THEME,
  ROSE_THEME,
  YELLOW_THEME
};
