import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CheckIcon = ({
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
      viewBox={"0 0 20 20"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_1444_1287)">
        <path
          d={
            "M7.49989 13.475L4.02489 10L2.84155 11.175L7.49989 15.8333L17.4999 5.83333L16.3249 4.65833L7.49989 13.475Z"
          }
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_1444_1287">
          <rect width={width} height={height} fill={fill} />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CheckIcon;
