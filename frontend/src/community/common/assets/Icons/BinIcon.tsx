import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const BinIcon = ({
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
      z={1}
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_746_10222)">
        <path
          d="M4.99996 15.8333C4.99996 16.75 5.74996 17.5 6.66663 17.5H13.3333C14.25 17.5 15 16.75 15 15.8333V5.83333H4.99996V15.8333ZM6.66663 7.5H13.3333V15.8333H6.66663V7.5ZM12.9166 3.33333L12.0833 2.5H7.91663L7.08329 3.33333H4.16663V5H15.8333V3.33333H12.9166Z"
          fill={fill}
          style={{
            fill: fill,
            fillOpacity: 1
          }}
        />
      </g>
      <defs>
        <clipPath id="clip0_746_10222">
          <rect
            width="20"
            height="20"
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
export default BinIcon;
