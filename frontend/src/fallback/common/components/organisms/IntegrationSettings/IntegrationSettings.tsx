import { SxProps } from "@mui/material";
import { ReactNode } from "react";

interface IntegrationSettingsProps {
  icon: ReactNode;
  title: string;
  description: string;
  isConnected?: boolean;
  onToggleConnection: () => void;
  styles?: SxProps;
  btnLoading?: boolean;
}

const IntegrationSettings = ({
  icon,
  title,
  description,
  isConnected = false,
  onToggleConnection,
  styles,
  btnLoading
}: IntegrationSettingsProps) => {
  return <></>;
};

export default IntegrationSettings;
