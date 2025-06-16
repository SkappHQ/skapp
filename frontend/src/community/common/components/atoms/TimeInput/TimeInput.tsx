import { Box, TextField, TextFieldProps, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime } from "luxon";
import { useState } from "react";

import { isTimePm } from "~community/attendance/utils/TimeUtils";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  time: Date;
  setTime: (time: Date) => void;
  label?: string;
  error?: string;
}

const TimeInput = ({ time, setTime, label, error }: Props) => {
  const theme: Theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleIconClick = () => {
    setOpen(true);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {label && (
        <Typography
          lineHeight={2.5}
          sx={{
            fontWeight: 500,
            color: error ? theme.palette.error.contrastText : "common.black"
          }}
        >
          {label}
        </Typography>
      )}

      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <MobileTimePicker
          value={DateTime.fromJSDate(time)}
          onChange={(value) => value && setTime(value.toJSDate())}
          open={open}
          onClose={() => setOpen(false)}
          ampm
          ampmInClock
          onOpen={() => setOpen(true)}
          slots={{
            textField: (params: TextFieldProps) => (
              <TextField
                {...params}
                helperText={null}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: <Icon name={IconName.TIME_SHEET_ICON} />
                }}
                style={{
                  backgroundColor: error
                    ? theme.palette.error.light
                    : theme.palette.grey[100],
                  border: error
                    ? `${theme.palette.error.contrastText} 0.0625rem solid`
                    : "none"
                }}
                sx={{
                  "&& .MuiInputBase-input": { p: "0.7813rem 1rem" },
                  "& .MuiOutlinedInput-root": {
                    "& > fieldset": {
                      border: "none"
                    }
                  },
                  borderRadius: "0.5rem"
                }}
              />
            )
          }}
          slotProps={{
            dialog: {
              sx: {
                "& .MuiPickersToolbar-penIconButton": { display: "none" },
                "& .MuiClock-amButton:hover": {
                  backgroundColor: isTimePm(time)
                    ? theme.palette.secondary.main
                    : theme.palette.primary.main
                },
                "& .MuiClock-pmButton:hover": {
                  backgroundColor: isTimePm(time)
                    ? theme.palette.primary.main
                    : theme.palette.secondary.main
                },
                "& .MuiClock-clock": {
                  "&:focus-within": {
                    outline: `0.125rem solid ${theme.palette.primary.main}`,
                    outlineOffset: "0.125rem"
                  }
                },
                "& .MuiPickersToolbarText-root": {
                  fontSize: "3rem",
                  fontWeight: "400"
                }
              }
            }
          }}
        />
      </LocalizationProvider>
      {!!error && (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.error.contrastText, marginTop: "0.3rem" }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default TimeInput;
