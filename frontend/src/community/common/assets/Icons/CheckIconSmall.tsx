import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CheckIconSmall = ({
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
      viewBox={"0 0 10 8"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M3.50008 6.08501L1.41508 4.00001L0.705078 4.70501L3.50008 7.50001L9.50008 1.50001L8.79508 0.795013L3.50008 6.08501Z"
        fill={fill}
      />
    </svg>
  );
};

export default CheckIconSmall;
