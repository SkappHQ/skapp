import { SxProps } from "@mui/material";
import { JSX } from "react";

interface Props {
  children?: JSX.Element;
  customContainerStyles?: SxProps;
}

const UpgradeOverlay = ({ children }: Props) => {
  return <>{children}</>;
};

export default UpgradeOverlay;
