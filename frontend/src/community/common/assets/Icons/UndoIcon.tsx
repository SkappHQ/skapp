import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const UndoIcon = ({
  fill = "#27272A",
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
      <g clipPath="url(#clip0_1645_1933)">
        <path
          d="M10.4167 6.66667C8.20835 6.66667 6.20835 7.49167 4.66669 8.83333L1.66669 5.83333V13.3333H9.16669L6.15002 10.3167C7.30835 9.35 8.78335 8.75 10.4167 8.75C13.3667 8.75 15.875 10.675 16.75 13.3333L18.725 12.6833C17.5667 9.19167 14.2917 6.66667 10.4167 6.66667Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_1645_1933">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default UndoIcon;
