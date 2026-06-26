import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const DropDownArrow = ({
  fill = "black",
  width = "10",
  height = "6",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M8.79289 1.15076L5 4.94365L1.20711 1.15076H8.79289Z"
        stroke={fill}
      />
    </svg>
  );
};

export default DropDownArrow;
