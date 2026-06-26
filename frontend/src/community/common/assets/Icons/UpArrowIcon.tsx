import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const UpArrowIcon = ({
  fill = "black",
  width = "16",
  height = "17",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_546_238)">
        <path
          d="M2.66699 8.50033L3.60699 9.44033L7.33366 5.72033V13.8337H8.66699V5.72033L12.387 9.44699L13.3337 8.50033L8.00033 3.16699L2.66699 8.50033Z"
          fill={fill}
          style={{
            fill: fill,
            fillOpacity: 1
          }}
        />
      </g>
      <defs>
        <clipPath id="clip0_546_238">
          <rect
            width="16"
            height="16"
            fill="white"
            style={{
              fill: "white",
              fillOpacity: 1
            }}
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default UpArrowIcon;
