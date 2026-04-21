import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CheckboxSelectedIcon = ({
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
        rx="1"
        fill={fill}
        stroke={fill}
        strokeWidth="2"
      />
      <g clipPath="url(#clip0_9582_14045)">
        <path
          d="M7.49818 13.4749L4.02318 9.99987L2.83984 11.1749L7.49818 15.8332L17.4982 5.8332L16.3232 4.6582L7.49818 13.4749Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_9582_14045">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CheckboxSelectedIcon;
