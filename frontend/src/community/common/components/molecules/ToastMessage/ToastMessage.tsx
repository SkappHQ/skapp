import { Box, Divider, IconButton, Snackbar, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { JSX, SyntheticEvent, useMemo } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { IconName } from "~community/common/types/IconTypes";
import { ToastProps } from "~community/common/types/ToastTypes";

import styles from "./styles";

const ToastMessage = ({
  key,
  open,
  onClose,
  title,
  description,
  toastType,
  autoHideDuration = 5000,
  handleToastClick,
  isIcon = true
}: ToastProps): JSX.Element => {
  const theme = useTheme();
  const classes = styles(theme);

  const { bgColor, color } = useMemo(() => {
    switch (toastType) {
      case ToastType.WARN:
        return {
          bgColor: theme.palette.amber.light,
          color: theme.palette.amber.main
        };
      case ToastType.SUCCESS:
        return {
          bgColor: theme.palette.greens.lightTertiary,
          color: theme.palette.greens.lightSecondary
        };
      case ToastType.INFO:
        return {
          bgColor: theme.palette.common.white,
          color: theme.palette.grey[700]
        };
      case ToastType.ERROR:
        return {
          bgColor: theme.palette.error.light,
          color: theme.palette.notifyBadge.main
        };
      default:
        return { bgColor: "", color: "" };
    }
  }, [toastType, theme]);

  const renderIcon = useMemo(() => {
    switch (toastType) {
      case ToastType.SUCCESS:
        return <Icon name={IconName.SUCCESS_ICON} />;
      case ToastType.INFO:
        return <Icon name={IconName.INFO_ICON} />;
      case ToastType.WARN:
        return <Icon name={IconName.WARNING_ICON} />;
      case ToastType.ERROR:
        return (
          <Icon
            name={IconName.INFO_ICON}
            fill={theme.palette.notifyBadge.main}
          />
        );
      default:
        return <Icon name={IconName.INFO_ICON} />;
    }
  }, [toastType]);

  return (
    <Snackbar
      key={key}
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={(_event: SyntheticEvent | Event, reason: string) => {
        if (reason === "clickaway") {
          return;
        }
        onClose?.();
      }}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{
        ...classes.stackStyle,
        cursor: handleToastClick ? "pointer" : "default"
      }}
      action={
        <Box onClick={handleToastClick} sx={classes.toastContainer(bgColor)}>
          {/* Vertical Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={classes.verticalDividerStyle(color)}
          />

          {/* Icon Section */}
          {isIcon && <Box sx={classes.iconSection(color)}>{renderIcon}</Box>}

          {/* Text Section */}
          <Box sx={classes.textSection}>
            <Typography variant="body1" sx={classes.titleStyle}>
              {title}
            </Typography>
            <Typography variant="body2" sx={classes.descriptionStyle}>
              {description}
            </Typography>
          </Box>

          {/* Close Button */}
          <Box aria-hidden={true}>
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
              sx={isIcon ? classes.iconBoxStyle : { display: "none" }}
            >
              <Icon name={IconName.CLOSE_ICON} />
            </IconButton>
          </Box>
        </Box>
      }
    />
  );
};

export default ToastMessage;
