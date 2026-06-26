import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CheckWrapperIcon = ({
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
            "M5.50013 9.47487L2.02513 5.99987L0.841797 7.17487L5.50013 11.8332L15.5001 1.8332L14.3251 0.658203L5.50013 9.47487Z"
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

export default CheckWrapperIcon;
