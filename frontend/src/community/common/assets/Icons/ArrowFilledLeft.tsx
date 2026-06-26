import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const ArrowFilledLeft = ({
  fill = "black",
  width = "4",
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
      viewBox="0 0 4 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M3.33333 0.667969L0 4.0013L3.33333 7.33463V0.667969Z"
        fill={fill}
      />
    </svg>
  );
};

export default ArrowFilledLeft;
