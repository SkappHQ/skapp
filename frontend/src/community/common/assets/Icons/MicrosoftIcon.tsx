import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const MicrosoftIcon = ({
  width = "21",
  height = "20",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path d="M10.0052 9.50516H0.5V0H10.0052V9.50516Z" fill="#F1511B" />
      <path d="M20.5002 9.50516H10.9951V0H20.5002V9.50516Z" fill="#80CC28" />
      <path d="M10.0049 20.0003H0.5V10.4951H10.0049V20.0003Z" fill="#00ADEF" />
      <path
        d="M20.5002 20.0003H10.9951V10.4951H20.5002V20.0003Z"
        fill="#FBBC09"
      />
    </svg>
  );
};

export default MicrosoftIcon;
