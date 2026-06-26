import { Box, IconButton, Paper, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { Stack, type SxProps } from "@mui/system";
import { JSX } from "react";

import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  id: string;
  label: string;
  fieldButtonAction: () => void;
  valueList?: string[];
  placeholder?: string;
  error?: string | string[];
  tooltip?: string;
  componentStyle?: SxProps;
  labelStyles?: SxProps;
  inputStyle?: SxProps;
  required?: boolean;
  isDisable?: boolean;
}

const InteractiveInputTrigger = ({
  id,
  label,
  valueList,
  fieldButtonAction,
  placeholder,
  componentStyle,
  error,
  labelStyles,
  tooltip,
  inputStyle,
  required,
  isDisable = false
}: Props): JSX.Element => {
  const theme: Theme = useTheme();

  return (
    // TODO: move styles to styles.ts
    <Box sx={{ ...componentStyle }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          paddingRight: ".875rem"
        }}
      >
        <Typography
          component="label"
          lineHeight={1.5}
          sx={{
            fontWeight: 500,
            color: isDisable
              ? theme.palette.text.disabled
              : error
                ? theme.palette.error.contrastText
                : "common.black",
            ...labelStyles
          }}
        >
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </Typography>
        {tooltip && !isDisable && <Tooltip title={tooltip} id="tooltip-id" />}
      </Stack>
      <Paper
        elevation={0}
        sx={{
          height: "3rem",
          bgcolor: isDisable
            ? theme.palette.grey[300]
            : error
              ? theme.palette.error.light
              : "grey.100",
          mt: ".5rem",
          p: ".75rem",
          pl: "1rem",
          borderRadius: ".5rem",
          overflow: "hidden",
          display: "flex",
          border: error
            ? `${theme.palette.error.contrastText} .0625rem solid`
            : "none",
          ...inputStyle,
          opacity: isDisable ? 0.6 : 1,
          pointerEvents: isDisable ? "none" : "auto"
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flex={1}
          flexWrap="wrap"
          sx={{
            width: "100%"
          }}
        >
          {placeholder &&
          placeholder?.trim().length > 0 &&
          (!valueList || valueList?.length === 0) ? (
            <Typography
              variant="body1"
              fontWeight={400}
              lineHeight="160%"
              fontStyle="italic"
              sx={{
                opacity: 1,
                color: isDisable
                  ? theme.palette.text.disabled
                  : theme.palette.grey[600]
              }}
            >
              {placeholder}
            </Typography>
          ) : (
            <Box>
              {valueList?.map((item: string, key: number) => (
                <BasicChip
                  chipStyles={{ my: ".375rem", mx: ".1875rem" }}
                  key={key}
                  label={item}
                />
              ))}
            </Box>
          )}
          <Box>
            <IconButton
              sx={{ p: 0.45 }}
              onClick={fieldButtonAction}
              id={id}
              disabled={isDisable}
            >
              <Icon name={IconName.RIGHT_ARROW_ICON} />
            </IconButton>
          </Box>
        </Stack>
      </Paper>
      {!!error && !isDisable && (
        <Box sx={{ mt: ".5rem" }} aria-live="polite" aria-atomic={true}>
          <Typography
            variant="body2"
            role="alert"
            aria-live="assertive"
            sx={{
              color: theme.palette.error.contrastText,
              lineHeight: "1rem"
            }}
          >
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default InteractiveInputTrigger;
