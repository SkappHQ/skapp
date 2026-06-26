import {
  Stack,
  type SxProps,
  Typography,
  TypographyProps
} from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { JSX, KeyboardEvent, MouseEvent, useMemo } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import { getRgbForBlink } from "~community/common/utils/describedSelectionUtils";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

import { styles } from "./styles";

interface Props {
  title: string;
  description: string;
  cardStyles?: SxProps;
  cardWrapperStyles?: SxProps;
  selected: boolean;
  isError?: boolean;
  onClick: (
    event: KeyboardEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>
  ) => void;
  typographyStyles: {
    variant: {
      title: TypographyProps["variant"];
      description: TypographyProps["variant"];
    };
    color: {
      title: string;
      description: string;
    };
  };
  isChevronIconVisible?: boolean;
  isAnimationOn?: boolean;
}

const DescribedSelection = ({
  title,
  description,
  cardStyles,
  cardWrapperStyles,
  selected,
  isError,
  onClick,
  typographyStyles,
  isChevronIconVisible = false,
  isAnimationOn = false
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const icon = useMemo(() => {
    if (selected) {
      return <Icon name={IconName.SUCCESS_ICON} />;
    } else if (isError) {
      return <Icon name={IconName.UNCHECKED_ICON} />;
    } else {
      return (
        <Icon name={IconName.UNCHECKED_ICON} fill={theme.palette.grey[500]} />
      );
    }
  }, [selected, isError, theme.palette.grey]);

  const rgbForBlink = useMemo(() => {
    return getRgbForBlink({ isAnimationOn, color: theme.palette.primary.main });
  }, [isAnimationOn, theme.palette.primary.main]);

  return (
    <Stack
      tabIndex={0}
      role="button"
      onClick={(e: MouseEvent<HTMLDivElement>) => onClick(e)}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (shouldActivateButton(e.key)) {
          onClick?.(e);
        }
      }}
      sx={mergeSx([
        classes.wrapper,
        cardWrapperStyles,
        isError ? classes.errorWrapper : {},
        isAnimationOn
          ? {
              ...classes.animatedWrapper,
              animation: "box-shadow-blink 1.5s ease-in-out infinite",
              "@keyframes box-shadow-blink": {
                "0%": {
                  boxShadow: `0 0 0.25rem 0.125rem rgb(${rgbForBlink})`
                },
                "50%": {
                  boxShadow: `0 0 0.5rem 0.25rem rgb(${rgbForBlink})`
                },
                "100%": {
                  boxShadow: `0 0 0.25rem 0.125rem rgb(${rgbForBlink})`
                }
              }
            }
          : {}
      ])}
    >
      <Stack sx={mergeSx([classes.container, cardStyles])}>
        <Stack sx={classes.iconWrapper}>{icon}</Stack>
        <Stack sx={classes.contentWrapper}>
          <Stack sx={classes.textWrapper}>
            <Typography
              variant={typographyStyles?.variant?.title}
              sx={{
                color: isError
                  ? theme.palette.error.contrastText
                  : typographyStyles?.color?.title
              }}
            >
              {title}
            </Typography>
            <Typography
              variant={typographyStyles?.variant?.description}
              sx={{
                color: isError
                  ? theme.palette.error.contrastText
                  : typographyStyles?.color?.description
              }}
            >
              {description}
            </Typography>
          </Stack>
          {isChevronIconVisible && (
            <Stack sx={classes.iconWrapper}>
              <Icon name={IconName.CHEVRON_RIGHT_ICON} />
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default DescribedSelection;
