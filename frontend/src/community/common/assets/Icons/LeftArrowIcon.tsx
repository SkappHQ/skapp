import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const LeftArrowIcon = ({
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
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_245_16693)">
        <path
          d="M16.6663 9.16634H6.52467L11.183 4.50801L9.99967 3.33301L3.33301 9.99967L9.99967 16.6663L11.1747 15.4913L6.52467 10.833H16.6663V9.16634Z"
          fill={fill}
          style={{ fill: fill, fillOpacity: 1 }}
        />
      </g>
      <defs>
        <clipPath id="clip0_245_16693">
          <rect
            width="20"
            height="20"
            fill="white"
            style={{ fill: "white", fillOpacity: 1 }}
          />
        </clipPath>
      </defs>
    </svg>
  );
};
export default LeftArrowIcon;
