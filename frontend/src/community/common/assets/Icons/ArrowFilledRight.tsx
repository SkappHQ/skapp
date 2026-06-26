import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const ArrowFilledRight = ({
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
        d="M0.666016 7.33463L3.99935 4.0013L0.666016 0.667969V7.33463Z"
        fill={fill}
      />
    </svg>
  );
};

export default ArrowFilledRight;
