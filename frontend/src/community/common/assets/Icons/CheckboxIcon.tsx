import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CheckboxIcon = ({
  fill = "black",
  width = "20",
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
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <rect
        x="1"
        y="1"
        width="18"
        height="18"
        rx="1"
        stroke={fill}
        strokeWidth="2"
      />
    </svg>
  );
};

export default CheckboxIcon;
