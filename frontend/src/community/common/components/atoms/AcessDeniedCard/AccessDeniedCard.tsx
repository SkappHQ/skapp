import { Stack, Typography } from "@mui/material";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

const AccessDeniedCard = () => {
  const classes = styles();

  const translateText = useTranslator("unauthorized");

  return (
    <Stack sx={classes.wrapper}>
      <Icon name={IconName.DENIED_ICON} />
      <Typography variant="h1" align="center">
        {translateText(["title"])}
      </Typography>
      <Stack sx={classes.textWrapper}>
        <Typography variant="body1" align="center">
          {translateText(["descriptionPartOne"])}
        </Typography>
        <Typography variant="body1" align="center">
          {translateText(["descriptionPartTwo"])}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default AccessDeniedCard;
