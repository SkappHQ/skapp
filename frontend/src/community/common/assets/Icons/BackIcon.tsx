import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const BackIcon = ({
  fill = "black",
  backgroundFill = "#E4E4E7",
  width = "36",
  height = "36",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 36 36"
      fill="none"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_1_2)">
        <path
          d="M36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36C27.9411 36 36 27.9411 36 18Z"
          style={{ fill: `${backgroundFill}` }}
        />
        <path
          d="M26 17H13.83L19.42 11.41L18 10L10 18L18 26L19.41 24.59L13.83 19H26V17Z"
          style={{ fill: `${fill}` }}
        />
      </g>
      <defs>
        <clipPath id="clip0_1_2">
          <rect width={width} height={height} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default BackIcon;
