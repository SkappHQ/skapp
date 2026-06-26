# Custom Themes

We have created some custom themes to be used in our application. These themes override the MUI5 theme and allow us to select a theme based on the brand color. The brand color is determined by an API endpoint, and when the API returns the brand color, we select one of these themes to override the MUI5 theme.

Each theme consists of two colors: a primary color and a secondary color. The primary color is used for the main background and text color, while the secondary color is used for accent elements and backgrounds.

## How We Create Custom themes

As an example the YELLOW_THEME object is a custom theme that has been created using the colors provided by the designer. so Here is an example of a theme file provided by the designer.

```
"theme": {
    "primary-color": {
      "value": "#fbbf24",
      ...
    },
    "primary-color-accent": {
      "value": "#f59e0b",
     ...
    },
    "primary-color-text": {
      "value": "#d97706",
      ...
    },
    "primary-color-background": {
      "value": "#fef3c7",
      ...
    }
}
```

we will create a custom theme using the color values provided in the designer's theme file.

```
export const YELLOW_THEME = {
  primary: {
    main: "#fbbf24", // primary-color
    dark: "#d97706", // primary-color-text
  },
  secondary: {
    main: "#FEF3C7", // primary-color-background
    dark: "#f59e0b", // primary-color-accent
  },
};
```

In this custom theme, we map the "primary-color" value from the designer's theme file to the main property of the primary object in our custom theme, and we map the "primary-color-text" value to the dark property of the primary object. We do the same for the "primary-color-background" and "primary-color-accent" values in the secondary object.

We can create additional custom themes using the same approach, mapping the color values provided by the designer to the appropriate properties in the primary and secondary objects.

## We currently have 6 custom themes available, which are:

- YELLOW_THEME:
  - primary
    - main: `#fbbf24`,
    - dark: `#d97706`,
  - secondary
    - main: `#FEF3C7`,
    - dark: `#f59e0b`,
- GREY_THEME:
  - primary
    - main: `#cbd5e1`,
    - dark: `#475569`,
  - secondary
    - main: `#f1f5f9`,
    - dark: `#475569`,
- BLUE_THEME :
  - primary
    - main: `#93c5fd`,
    - dark: `#2563eb`,
  - secondary
    - main: `#dbeafe`,
    - dark: `#3b82f6`,
- GREEN_THEME :
  - primary
    - main: `#bef264`,
    - dark: `#65a30d`,
  - secondary
    - main: `#ecfccb`,
    - dark: `#65a30d`,
- ORANGE_THEME :
  - primary
    - main: `#fdba74`,
    - dark: `#f97316`,
  - secondary
    - main: `#ffedd5`,
    - dark: `#f97316`,
- PURPLE_THEME :
  - primary
    - main: `#d8b4fe`,
    - dark: `#9333ea`,
  - secondary
    - main: `#f3e8ff`,
    - dark: `#a855f7`,
- ROSE_THEME :
  - primary
    - main: `#fda4af`,
    - dark: `#f43f5e`,
  - secondary
    - main: `#ffe4e6`,
    - dark: `#f43f5e`,

These themes provide a consistent and cohesive color scheme throughout the application, and allow us to easily adapt to the brand colors.
