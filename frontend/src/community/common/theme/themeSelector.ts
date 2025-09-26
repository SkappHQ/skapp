import {
  type PaletteOptions,
  type SimplePaletteColorOptions,
  type Theme,
  createTheme
} from "@mui/material/styles";

import { ThemeTypes } from "~community/common/types/AvailableThemeColors";

import { theme } from "./theme";
import {
  BLUE_THEME,
  GREEN_THEME,
  ORANGE_THEME,
  PURPLE_THEME,
  ROSE_THEME,
  YELLOW_THEME
} from "./themesData";

function setTailwindPrimary(
  main: string,
  accent?: string,
  text?: string,
  background?: string
) {
  if (typeof window !== "undefined") {
    document.documentElement.style.setProperty("--color-primary", main);
    document.documentElement.style.setProperty(
      "--color-primary-accent",
      accent || "#408ce4"
    );
    document.documentElement.style.setProperty(
      "--color-primary-text",
      text || "#2a61a0"
    );
    document.documentElement.style.setProperty(
      "--color-primary-background",
      background || "#dbeafe"
    );
  }
}

export const themeSelector = (color: string): Theme => {
  let selectedTheme = BLUE_THEME;
  const getPalette = (theme: any) => ({
    main: (theme.primary as SimplePaletteColorOptions)?.main || "#93c5fd",
    accent: (theme.primary as SimplePaletteColorOptions)?.light || "#408ce4",
    text:
      (theme.primary as SimplePaletteColorOptions)?.contrastText || "#2a61a0",
    background: (theme.background as any)?.default || "#dbeafe"
  });
  if (
    !Object.values(ThemeTypes)
      .map((type) => type.toUpperCase())
      .includes(color?.toUpperCase())
  ) {
    const { main, accent, text, background } = getPalette(selectedTheme);
    setTailwindPrimary(main, accent, text, background);
    return muiThemeOverride(selectedTheme);
  }
  for (const key in ThemeTypes) {
    if (Object.prototype.hasOwnProperty.call(ThemeTypes, key)) {
      const themeKey = key as keyof typeof ThemeTypes;
      if (ThemeTypes[themeKey].toUpperCase() === color.toUpperCase()) {
        switch (key) {
          case "YELLOW_THEME":
            selectedTheme = YELLOW_THEME;
            break;
          case "BLUE_THEME":
            selectedTheme = BLUE_THEME;
            break;
          case "ROSE_THEME":
            selectedTheme = ROSE_THEME;
            break;
          case "GREEN_THEME":
            selectedTheme = GREEN_THEME;
            break;
          case "PURPLE_THEME":
            selectedTheme = PURPLE_THEME;
            break;
          case "ORANGE_THEME":
            selectedTheme = ORANGE_THEME;
            break;
          default:
            selectedTheme = BLUE_THEME;
        }
        const { main, accent, text, background } = getPalette(selectedTheme);
        setTailwindPrimary(main, accent, text, background);
        return muiThemeOverride(selectedTheme);
      }
    }
  }
  selectedTheme = PURPLE_THEME;
  const { main, accent, text, background } = getPalette(selectedTheme);
  setTailwindPrimary(main, accent, text, background);
  return muiThemeOverride(selectedTheme);
};

const muiThemeOverride = (selectedTheme: Partial<PaletteOptions>): Theme => {
  return createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      primary: {
        ...theme.palette.primary,
        main: (selectedTheme?.primary as SimplePaletteColorOptions)?.main,
        dark: (selectedTheme.primary as SimplePaletteColorOptions).dark
      },
      secondary: {
        ...theme.palette.secondary,
        main: (selectedTheme.secondary as SimplePaletteColorOptions).main,
        dark: (selectedTheme.secondary as SimplePaletteColorOptions).dark
      }
    }
  });
};
