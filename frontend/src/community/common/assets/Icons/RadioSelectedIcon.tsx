import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const RadioSelectedIcon = ({
  fill = "#21517D",
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
        rx="9"
        stroke={fill}
        strokeWidth="2"
      />
      <rect
        x="5.16797"
        y="5.16602"
        width="9.66667"
        height="9.66667"
        rx="4.83333"
        fill={fill}
        stroke={fill}
        strokeWidth="2"
      />
    </svg>
  );
};

export default RadioSelectedIcon;