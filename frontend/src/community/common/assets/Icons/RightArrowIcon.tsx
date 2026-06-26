import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const RightArrowIcon = ({
  fill = "black",
  width = "18",
  height = "19",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_739_1794)">
        <path
          d="M10.5 3.33331L9.32504 4.50831L13.975 9.16665H3.83337V10.8333H13.975L9.32504 15.4916L10.5 16.6666L17.1667 9.99998L10.5 3.33331Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_739_1794">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
export default RightArrowIcon;
