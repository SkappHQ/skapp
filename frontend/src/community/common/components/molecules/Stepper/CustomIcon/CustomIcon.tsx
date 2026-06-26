import { Stack, Typography, useTheme } from "@mui/material";
import { useMemo } from "react";

import CheckIconSmall from "~community/common/assets/Icons/CheckIconSmall";

import styles from "./styles";

interface Props {
  isActive?: boolean;
  completed?: boolean;
  stepNumber: string;
}

const CustomIcon = ({ isActive, completed, stepNumber }: Props) => {
  const theme = useTheme();
  const classes = styles();

  const wrapperStyles = useMemo(() => {
    return {
      color:
        completed || isActive
          ? theme.palette.primary.dark
          : theme.palette.grey.A100,
      backgroundColor: completed
        ? theme.palette.primary.main
        : isActive
          ? theme.palette.secondary.main
          : theme.palette.common.white,
      border: completed
        ? "none"
        : isActive
          ? `.0625rem solid ${theme.palette.primary.dark}`
          : `.0625rem solid ${theme.palette.grey.A100}`
    };
  }, [completed, isActive]);

  return (
    <Stack
      sx={{
        ...wrapperStyles,
        ...classes.wrapper
      }}
    >
      {completed ? (
        <CheckIconSmall
          width="12"
          height="12"
          fill={theme.palette.primary.dark}
        />
      ) : (
        <Typography
          variant="caption"
          sx={{
            color: isActive
              ? theme.palette.primary.dark
              : theme.palette.grey.A100
          }}
        >
          {stepNumber}
        </Typography>
      )}
    </Stack>
  );
};

export default CustomIcon;
