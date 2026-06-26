import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const HourGlassEmptyIcon = ({
  fill = "#2A61A0",
  width = "25",
  height = "24"
}: IconProps): JSX.Element => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
    >
      <g clipPath="url(#a)">
        <path
          fill={fill}
          d="M6.666 2v6h.01l-.01.01 4 3.99-4 4 .01.01h-.01V22h12v-5.99h-.01l.01-.01-4-4 4-3.99-.01-.01h.01V2h-12Zm10 14.5V20h-8v-3.5l4-4 4 4Zm-4-5-4-4V4h8v3.5l-4 4Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M.666 0h24v24h-24z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default HourGlassEmptyIcon;
