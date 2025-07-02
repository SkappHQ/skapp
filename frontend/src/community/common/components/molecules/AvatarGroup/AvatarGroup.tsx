import styled from "@emotion/styled";
import {
  Box,
  Fade,
  AvatarGroup as MuiAvatarGroup,
  Popper,
  type SxProps,
  type Theme,
  useTheme
} from "@mui/material";
import { FC, useRef, useState } from "react";

import HoverAvatarModal from "~community/common/components/molecules/HoverAvatarModal/HoverAvatarModal";
import { AvatarPropTypes } from "~community/common/types/MoleculeTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import AvatarGroupAvatar from "./AvatarGroupAvatar";
import styles from "./styles";

interface Props {
  avatars: Array<AvatarPropTypes>;
  max?: number;
  hoverModalTitle?: string;
  total?: number;
  avatarStyles?: SxProps<Theme>;
  componentStyles?: SxProps<Theme>;
  hasStyledBadge?: boolean;
  onClick?: () => void;
  isHover?: boolean;
  isHoverModal?: boolean;
}

const StyledPopper = styled(Popper)`
  z-index: 1301;
`;

const AvatarGroup: FC<Props> = ({
  avatars,
  max = 3,
  total,
  avatarStyles,
  hoverModalTitle = "",
  componentStyles,
  hasStyledBadge = false,
  onClick,
  isHover = false,
  isHoverModal = false
}) => {
  const theme: Theme = useTheme();

  const classes = styles(theme);

  const [newMaxValue, setNewMaxValue] = useState<number>(max);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const anchorElement = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (): void => {
    setNewMaxValue(isHover ? avatars.length : max);
    if (isHoverModal && avatars.length >= newMaxValue)
      setAnchorEl(anchorElement.current);
  };

  const handleMouseLeave = (): void => {
    setNewMaxValue(max);
    if (isHoverModal) setAnchorEl(null);
  };

  const ariaLabel = avatars
    .map((avatar) =>
      `${avatar.firstName || ""} ${avatar.lastName || ""}`.trim()
    )
    .join(", ");

  return (
    <>
      <MuiAvatarGroup
        max={newMaxValue}
        total={total}
        sx={mergeSx([componentStyles, classes.avatarGroup(Boolean(onClick))])}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={anchorElement}
        data-cy="avatar-group"
        aria-label={ariaLabel}
      >
        {avatars.map(({ firstName, image, lastName, leaveState }, index) => (
          <AvatarGroupAvatar
            key={index}
            index={index}
            firstName={firstName}
            lastName={lastName}
            image={image}
            hasStyledBadge={hasStyledBadge}
            leaveState={leaveState}
            avatarStyles={avatarStyles}
          />
        ))}
      </MuiAvatarGroup>
      <StyledPopper
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="right"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={0}>
            <Box sx={classes.hoverAvatarModalWrapper}>
              <HoverAvatarModal
                hoverModalTitle={hoverModalTitle}
                avatars={avatars}
              />
            </Box>
          </Fade>
        )}
      </StyledPopper>
    </>
  );
};

export default AvatarGroup;
