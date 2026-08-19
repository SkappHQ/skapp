import { SxProps } from "@mui/material";
import { JSX } from "react";

/**
 * Community-build stub for the enterprise UpgradeOverlay. There is no tier to
 * upgrade from here, so no overlay is drawn - but the children still have to
 * render, otherwise every caller silently loses its content.
 */
interface Props {
  children?: JSX.Element;
  customContainerStyles?: SxProps;
}

const UpgradeOverlay = ({ children }: Props) => {
  return <>{children}</>;
};

export default UpgradeOverlay;
