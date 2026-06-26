import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

const NoDataScreen: FC = () => {
  const theme: Theme = useTheme();

  const classes = styles(theme);
  const translateText = useTranslator("noData");

  return (
    <Stack sx={classes.wrapper}>
      <Stack spacing={1} sx={classes.container} component="div" role="status">
        <Box sx={classes.titleWrapper}>
          <Icon
            name={IconName.MAGNIFYING_GLASS_ICON}
            fill={theme.palette.grey[200]}
          />
        </Box>
        <Box>
          <Typography variant="body1" color={theme.palette.text.blackText}>
            {translateText(["title"])}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

export default NoDataScreen;
