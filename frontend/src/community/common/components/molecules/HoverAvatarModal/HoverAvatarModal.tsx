import { Box, Divider, Typography } from "@mui/material";
import { JSX } from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import { AvatarPropTypes } from "~community/common/types/MoleculeTypes";

import styles from "./styles";

interface HoverAvatarModalProps {
  avatars: Array<AvatarPropTypes>;
  hoverModalTitle: string;
}

const HoverAvatarModal = ({
  avatars,
  hoverModalTitle
}: HoverAvatarModalProps): JSX.Element => {
  const classes = styles();

  const renderTitle = () =>
    hoverModalTitle && (
      <Typography variant="h5" sx={classes.title}>
        {hoverModalTitle}
      </Typography>
    );

  const renderAvatars = () =>
    avatars.map(({ firstName, image, lastName }, index: number) => (
      <Box key={index} sx={classes.avatarChipWrapper}>
        <AvatarChip
          avatarUrl={image as string}
          firstName={firstName as string}
          lastName={lastName as string}
          chipStyles={classes.avatarChip}
          hasStyledBadge
        />
      </Box>
    ));

  return (
    <Box sx={classes.wrapper}>
      <Box component="div" sx={classes.columnOne}>
        {renderTitle()}
      </Box>
      <Box sx={classes.columnTwo}>
        <Divider />
        <Box sx={classes.avatarWrapper}>{renderAvatars()}</Box>
      </Box>
    </Box>
  );
};

export default HoverAvatarModal;
