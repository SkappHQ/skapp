import { AvatarGroup, Fade, Popper } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { Box, type SxProps, styled } from "@mui/system";
import { FC, useRef, useState } from "react";

import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import { AvatarPropTypes } from "~community/common/types/MoleculeTypes";

import HoverManagerModal from "../HoverManagerModal/HoverManagerModal";

interface Props {
  avatars: Array<AvatarPropTypes>;
  total?: number;
  styles?: SxProps;
  componenStyles?: SxProps;
  onClick?: () => void;
  isHoverModal?: boolean;
}

const StyledPopper = styled(Popper)`
  z-index: 1301;
`;

const SupervisorAvatarGroup: FC<Props> = ({
  avatars,
  total,
  styles,
  componenStyles,
  onClick,
  isHoverModal = false
}) => {
  const theme: Theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hoveredAvatar, setHoveredAvatar] = useState<AvatarPropTypes | null>(
    null
  );
  const anchorElement = useRef<HTMLDivElement>(null);

  const onMouseEnter = ({
    firstName,
    lastName,
    image,
    primaryManager,
    managerType
  }: AvatarPropTypes): void => {
    if (isHoverModal) {
      setHoveredAvatar({
        firstName,
        lastName,
        image,
        primaryManager,
        managerType
      });
      setAnchorEl(anchorElement.current);
    }
  };
  const onMouseLeave = (): void => {
    if (isHoverModal) {
      setAnchorEl(null);
      setHoveredAvatar(null);
    }
  };
  return (
    <div>
      <AvatarGroup
        total={total}
        sx={{
          ...componenStyles,
          cursor: onClick ? "pointer" : "default"
        }}
        onClick={onClick}
        ref={anchorElement}
      >
        {avatars?.map(
          (
            { image, primaryManager, managerType, firstName, lastName },
            index
          ) => {
            return (
              <Avatar
                key={index}
                firstName={firstName ?? ""}
                lastName={lastName ?? ""}
                src={image ?? ""}
                sx={{
                  ...styles,
                  width: "2.25rem",
                  height: "2.25rem"
                }}
                onMouseEnter={() =>
                  onMouseEnter({
                    firstName,
                    image,
                    primaryManager,
                    managerType,
                    lastName
                  })
                }
                onMouseLeave={onMouseLeave}
              />
            );
          }
        )}
      </AvatarGroup>
      <StyledPopper
        open={Boolean(anchorEl) && Boolean(hoveredAvatar)}
        anchorEl={anchorEl}
        placement="left"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={0}>
            <Box
              sx={{
                backgroundColor: theme.palette.grey[100],
                width: "auto",
                borderRadius: ".75rem",
                overflow: "hidden",
                boxShadow: `0rem .25rem 1.25rem 0rem ${theme.palette.grey.A100}`,
                p: ".75rem"
              }}
            >
              <HoverManagerModal
                image={hoveredAvatar?.image ?? ""}
                firstName={hoveredAvatar?.firstName ?? ""}
                lastName={hoveredAvatar?.lastName ?? ""}
                primaryManager={hoveredAvatar?.primaryManager ?? false}
                managerType={hoveredAvatar?.managerType}
              />
            </Box>
          </Fade>
        )}
      </StyledPopper>
    </div>
  );
};

export default SupervisorAvatarGroup;
