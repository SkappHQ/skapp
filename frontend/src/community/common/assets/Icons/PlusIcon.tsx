import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const PlusIcon = ({
  fill = "black",
  width = "16",
  height = "16",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_2201_4590)">
        <path
          d="M12.6668 8.66634H8.66683V12.6663H7.3335V8.66634H3.3335V7.33301H7.3335V3.33301H8.66683V7.33301H12.6668V8.66634Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_2201_4590">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PlusIcon;
