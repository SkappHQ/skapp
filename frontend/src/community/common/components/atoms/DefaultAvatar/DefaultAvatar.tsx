import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { type AvatarProps, Box, type SxProps, Typography } from "@mui/material";
import { JSX } from "react";

import { mergeSx } from "~community/common/utils/commonUtil";

import styles from "./styles";

interface Props extends AvatarProps {
  firstName: string;
  lastName: string;
  typographyStyles?: SxProps;
  containerStyles?: SxProps;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const DefaultAvatar = ({
  firstName,
  lastName,
  typographyStyles,
  containerStyles,
  onClick,
  onMouseEnter,
  onMouseLeave
}: Props): JSX.Element => {
  const classes = styles();

  const getInitials = () =>
    `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;

  return (
    <Box
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={mergeSx([classes.avatarContainer, containerStyles])}
      aria-hidden="true"
    >
      {firstName && lastName ? (
        <Typography sx={mergeSx([classes.typography, typographyStyles])}>
          {getInitials()}
        </Typography>
      ) : (
        <AccountCircleIcon sx={classes.icon} />
      )}
    </Box>
  );
};

export default DefaultAvatar;
