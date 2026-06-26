import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const RoundedCloseIcon = ({
  fill = "black",
  width = "24",
  height = "24",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_501_18559)">
        <path
          d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z"
          fill={fill}
          style={{
            fill: fill,
            fillOpacity: 1
          }}
        />
      </g>
      <defs>
        <clipPath id="clip0_501_18559">
          <rect
            width="24"
            height="24"
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

export default RoundedCloseIcon;
