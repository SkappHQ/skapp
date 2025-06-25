import { Chip, type SxProps } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FC, MouseEvent, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import { TooltipPlacement } from "~community/common/enums/ComponentEnums";
import { useMediaQuery } from "~community/common/hooks/useMediaQuery";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import styles from "./styles";

interface Props {
  firstName: string;
  lastName: string;
  avatarUrl: string | undefined;
  chipStyles?: SxProps;
  isResponsiveLayout?: boolean;
  onClickChip?: () => void;
  onMouseEnterChip?: (e?: MouseEvent<HTMLElement>) => void;
  onMouseLeaveChip?: () => void;
  hasStyledBadge?: boolean;
  mediumScreenWidth?: number;
  smallScreenWidth?: number;
  isTooltipEnabled?: boolean;
  isDeleteAvailable?: boolean;
  onDeleteChip?: () => void;
  isNotEllipsis?: boolean;
  isDisabled?: boolean;
  tabIndex?: number;
}

const AvatarChip: FC<Props> = ({
  firstName,
  lastName,
  avatarUrl,
  chipStyles = {},
  isResponsiveLayout = false,
  onClickChip,
  onMouseEnterChip,
  onMouseLeaveChip,
  hasStyledBadge = false,
  mediumScreenWidth = 1445,
  smallScreenWidth = 1150,
  isTooltipEnabled = false,
  isDeleteAvailable = false,
  onDeleteChip,
  isNotEllipsis = false,
  isDisabled = false,
  tabIndex
}) => {
  const theme = useTheme();
  const classes = styles(theme);

  const queryMatches = useMediaQuery();
  const isMediumScreen = queryMatches(`(max-width: ${mediumScreenWidth}px)`);
  const isSmallScreen = queryMatches(`(max-width: ${smallScreenWidth}px)`);

  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleTooltipOpen = (event: MouseEvent<HTMLElement>) => {
    if (isTooltipEnabled) {
      setIsTooltipOpen(true);
    }
    if (onMouseEnterChip) {
      onMouseEnterChip(event);
    }
  };

  const handleTooltipClose = () => {
    if (isTooltipEnabled) {
      setIsTooltipOpen(false);
    }
    if (onMouseLeaveChip) {
      onMouseLeaveChip();
    }
  };

  if (isSmallScreen && isResponsiveLayout) {
    return (
      <Avatar
        firstName={firstName}
        lastName={lastName}
        alt={`${firstName} ${lastName}`}
        src={avatarUrl as string}
        onClick={onClickChip}
        sx={classes.avatar}
      />
    );
  }

  const chipComponent = (
    <Chip
      onMouseEnter={handleTooltipOpen}
      onMouseLeave={handleTooltipClose}
      avatar={
        <Avatar
          firstName={firstName}
          lastName={lastName}
          alt={`${firstName} ${lastName}`}
          src={avatarUrl as string}
          onClick={onClickChip}
          sx={classes.avatar}
        />
      }
      label={
        isMediumScreen && isResponsiveLayout
          ? firstName
          : `${firstName} ${lastName}`
      }
      sx={mergeSx([
        classes.chip(isNotEllipsis),
        hasStyledBadge ? classes.avatarImage : {},
        chipStyles
      ])}
      onClick={onClickChip}
      onDelete={isDeleteAvailable && onDeleteChip ? onDeleteChip : undefined}
      deleteIcon={
        isDeleteAvailable ? (
          <Icon name={IconName.CLOSE_ICON} width="10" height="10" />
        ) : undefined
      }
      disabled={isDisabled}
      tabIndex={tabIndex}
    />
  );

  if (onClickChip || isTooltipEnabled) {
    return (
      <Tooltip
        title={`${firstName} ${lastName}`}
        placement={TooltipPlacement.TOP}
        open={isTooltipOpen}
        ariaLabel={`${firstName} ${lastName}`}
        tabIndex={tabIndex}
      >
        {chipComponent}
      </Tooltip>
    );
  }

  return chipComponent;
};

export default AvatarChip;
