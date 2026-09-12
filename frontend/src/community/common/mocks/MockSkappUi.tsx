import { FC, ReactNode } from "react";

interface ButtonV2Props {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

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
