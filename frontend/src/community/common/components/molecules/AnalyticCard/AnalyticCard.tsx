import { Box, Theme, Typography, useTheme } from "@mui/material";
import { FC, ReactNode } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

import styles from "./styles";

interface Props {
  title?: string;
  isExpandable?: boolean;
  onExpand?: () => void;
  children?: ReactNode;
  accessibility?: {
    tabIndex?: number;
    role?: string;
  };
}

const AnalyticCard: FC<Props> = ({
  title,
  children,
  isExpandable = false,
  onExpand,
  accessibility
}) => {
  const theme: Theme = useTheme();
  const classes = styles();

  return (
    <>
      <Box
        sx={classes.card}
        tabIndex={accessibility?.tabIndex ?? -1}
        role={accessibility?.role ?? "group"}
        onKeyDown={(e) => {
          if (shouldActivateButton(e.key)) {
            onExpand?.();
          }
        }}
      >
        <>
          <Box display={"flex"} justifyContent="space-between">
            <Typography
              fontSize={14}
              fontWeight={400}
              color={theme.palette.text.textGrey}
            >
              {title}
            </Typography>
            {isExpandable && (
              <Box sx={{ cursor: "pointer" }} onClick={onExpand}>
                <Icon name={IconName.NEW_WINDOW_ICON} />
              </Box>
            )}
          </Box>
          <Box>{children}</Box>
        </>
      </Box>
    </>
  );
};

export default AnalyticCard;
