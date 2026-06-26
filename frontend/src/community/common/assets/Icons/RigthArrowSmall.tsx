import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const RightArrowSmall = ({
  fill = "black",
  width = "12",
  height = "12",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M5.74935 0.666748L4.80935 1.60675L8.52935 5.33341H0.416016V6.66675H8.52935L4.80935 10.3934L5.74935 11.3334L11.0827 6.00008L5.74935 0.666748Z"
        fill={fill}
      />
    </svg>
  );
};

export default RightArrowSmall;
