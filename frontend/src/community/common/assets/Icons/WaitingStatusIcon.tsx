import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const WaitingStatusIcon = ({
  fill = "none",
  width = "8",
  height = "8",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 8 8"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <circle cx="4" cy="4" r="3" stroke="#F59E0B" strokeWidth="2" />
    </svg>
  );
};

export default WaitingStatusIcon;
