import { Chip, Stack } from "@mui/material";
import { SxProps, type Theme, useTheme } from "@mui/material/styles";
import { FC } from "react";

import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import { AvatarPropTypes } from "~community/common/types/MoleculeTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import styles from "./styles";

interface Props {
  avatars: Array<AvatarPropTypes> | [];
  label?: string;
  max?: number;
  total?: number;
  wrapperStyles?: SxProps<Theme>;
  avatarStyles?: SxProps<Theme>;
  chipStyles?: SxProps<Theme>;
  componentStyles?: SxProps<Theme>;
}

const AvatarGroupWithBadge: FC<Props> = ({
  avatars,
  label,
  max,
  total,
  chipStyles,
  avatarStyles,
  wrapperStyles,
  componentStyles
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  return (
    <Stack sx={mergeSx([classes.wrapper, wrapperStyles])}>
      <AvatarGroup
        avatars={avatars}
        max={max}
        total={total}
        componentStyles={mergeSx([classes.componentStyles, componentStyles])}
        avatarStyles={avatarStyles}
      />
      {avatars.length && label ? (
        <Chip
          label={label}
          size="small"
          sx={mergeSx([classes.chip, chipStyles])}
        />
      ) : (
        <></>
      )}
    </Stack>
  );
};

export default AvatarGroupWithBadge;
