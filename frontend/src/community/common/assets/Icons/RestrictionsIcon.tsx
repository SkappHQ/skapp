import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const RestrictionsIcon = ({
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
      <g clipPath="url(#clip0_998_977)">
        <path
          d="M8 0.666992L2 3.33366V7.33366C2 11.0337 4.56 14.4937 8 15.3337C11.44 14.4937 14 11.0337 14 7.33366V3.33366L8 0.666992ZM12.6667 7.33366C12.6667 10.347 10.68 13.127 8 13.9537C5.32 13.127 3.33333 10.347 3.33333 7.33366V4.20033L8 2.12699L12.6667 4.20033V7.33366ZM4.94 7.72699L4 8.66699L6.66667 11.3337L12 6.00033L11.06 5.05366L6.66667 9.44699L4.94 7.72699Z"
          fill={fill}
          style={{
            fill: fill,
            fillOpacity: 1
          }}
        />
      </g>
      <defs>
        <clipPath id="clip0_998_977">
          <rect
            width="16"
            height="16"
            fill="white"
            style={{
              fill: "white",
              fillOpacity: 1
            }}
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default RestrictionsIcon;
