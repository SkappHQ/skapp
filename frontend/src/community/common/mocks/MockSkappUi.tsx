import type { ButtonV2Props } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

export const ButtonV2: FC<ButtonV2Props> = ({
  children,
  onClick,
  disabled,
  type
}) => (
  <button onClick={onClick} disabled={disabled} type={type}>
    {children}
  </button>
);

export const HandshakeIcon: FC = () => null;

export const ReportIcon: FC = () => null;
