import { Box, Stack, type SxProps, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { JSX, MouseEventHandler } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { peopleDirectoryTestId } from "~community/common/constants/testIds";
import { IconName } from "~community/common/types/IconTypes";

import bannerStyles from "./styles";

interface Props {
  startingIcon?: IconName;
  count?: number;
  title: string;
  titleForOne: string;
  prompt: string;
  styles?: SxProps;
  onClick: MouseEventHandler<HTMLDivElement>;
}

const EmployeeDataBanner = ({
  startingIcon,
  count,
  title,
  titleForOne,
  prompt,
  styles,
  onClick
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const classes = bannerStyles(theme);

  return (
    <Box sx={classes.bannerContainerStyles(styles)}>
      <Stack direction="row" gap="1rem">
        <Stack direction="row" alignItems="center" gap="0.5rem">
          {startingIcon && (
            <Icon name={startingIcon} fill={theme.palette.primary.dark} />
          )}
          <Typography id="banner-title" sx={classes.bannerTextStyles}>
            {count === 1 ? titleForOne : `${count} ${title}`}
          </Typography>
        </Stack>
        <Typography
          sx={{
            ...classes.bannerPromptStyles,
            textDecoration: "underline",
            textDecorationSkipInk: "none"
          }}
          onClick={onClick}
          data-testid={peopleDirectoryTestId.employeeDataBanner}
          role="link"
          tabIndex={0}
          aria-describedby="banner-title"
        >
          {prompt}
        </Typography>
      </Stack>
    </Box>
  );
};

export default EmployeeDataBanner;
