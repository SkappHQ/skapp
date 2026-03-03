import { type Theme, useTheme } from "@mui/material/styles";
import { type StylesConfig } from "react-select";

import { APP_FONT } from "~community/common/constants/configs";

export const useGetSelectStyles = (error: string | string[]) => {
  const theme: Theme = useTheme();

  const commonStyles = {
    fontSize: "1rem",
    fontWeight: 400,
    fontFamily: APP_FONT,
    fontStyle: "normal",
    margin: "0rem",
    color: error
      ? theme.palette.error.contrastText
      : theme.palette.text.secondary
  };
  const selectStyles: StylesConfig = {
    control: (styles) => ({
      ...styles,
      ...commonStyles,
      backgroundColor: error
        ? theme.palette.error.light
        : theme.palette.grey[100],
      outline: "none",
      border: error
        ? `${theme.palette.error.contrastText} .0625rem solid`
        : "none",
      boxShadow: "none",
      borderRadius: ".5rem",
      paddingLeft: "0rem",
      ":hover": {
        border: error
          ? `${theme.palette.error.contrastText} .0625rem solid`
          : "none"
      }
    }),
    option: (styles, { isDisabled, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
            ? theme.palette.secondary.main
            : undefined,
        color: theme.palette.common.black,
        cursor: isDisabled ? "not-allowed" : "default",
        fontSize: "1rem",
        fontWeight: 400,
        fontFamily: APP_FONT,
        fontStyle: "normal",
        paddingLeft: ".9375rem",
        paddingTop: ".125rem",
        ":hover": {
          backgroundColor: theme.palette.grey[100]
        }
      };
    },
    input: (styles) => ({
      ...styles,
      padding: "0rem",
      margin: "0rem",
      paddingTop: ".75rem",
      paddingBottom: ".75rem"
    }),
    placeholder: (styles) => ({
      ...styles,
      padding: "0rem",
      margin: "0rem",
      color: theme.palette.text.secondary,
      fontSize: "1rem",
      fontWeight: 400,
      opacity: 0.45
    }),
    singleValue: (styles) => ({
      ...styles,
      ...commonStyles
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      padding: "0rem ",
      paddingRight: ".375rem",
      color: theme.palette.grey[700]
    }),
    valueContainer: (styles) => ({
      ...styles,
      marginLeft: "1rem",
      padding: "auto",
      height: "3rem",
      overflowY: "auto"
    }),
    indicatorSeparator: (styles) => ({
      ...styles,
      backgroundColor: theme.palette.grey[100]
    }),
    multiValue: (styles, { isDisabled }) => {
      return {
        ...styles,
        backgroundColor: "white",
        borderRadius: "4rem",
        color: "black",
        paddingLeft: ".25rem",
        paddingRight: isDisabled ? ".5rem" : ".25rem"
      };
    },
    multiValueRemove: (styles, { isDisabled }) => {
      return {
        ...styles,
        display: isDisabled ? "none" : "flex",
        justifyContent: "center",
        alignItems: "center"
      };
    }
  };

  return selectStyles;
};
