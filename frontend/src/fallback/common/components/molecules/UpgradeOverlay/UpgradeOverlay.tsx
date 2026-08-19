import { Stack, SxProps } from "@mui/material";
import { JSX } from "react";

interface Props {
  children?: JSX.Element;
  customContainerStyles?: SxProps;
}

const UpgradeOverlay = ({ children, customContainerStyles }: Props) => {
  return <Stack sx={customContainerStyles}>{children}</Stack>;
};

export default UpgradeOverlay;
