import { Box, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC } from "react";

import styles from "./styles";

interface Props {
  label: string;
  text: string | undefined;
  id?: string;
  isDisabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  isReadOnly?: boolean;
}

const StatusPopupColumn: FC<Props> = ({
  label,
  text,
  id,
  isDisabled,
  error,
  errorMessage,
  isReadOnly = false
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);
  return (
    <Box sx={classes.outerBox} tabIndex={0}>
      <Typography
        htmlFor={id}
        component="label"
        variant="body1"
        sx={classes.labelText(error)}
      >
        {label} :
      </Typography>
      <textarea
        id={id}
        readOnly={isReadOnly}
        style={classes.textareaStyle(error)}
        value={text}
        disabled={isDisabled ?? false}
      />
      {error && (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.error.contrastText }}
          component="p"
        >
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default StatusPopupColumn;
