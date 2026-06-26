import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const DashboardIcon = ({
  fill = "black",
  width = "24",
  height = "25",
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
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_16_1466)">
        <path
          d="M19 5.65076V7.65076H15V5.65076H19ZM9 5.65076V11.6508H5V5.65076H9ZM19 13.6508V19.6508H15V13.6508H19ZM9 17.6508V19.6508H5V17.6508H9ZM21 3.65076H13V9.65076H21V3.65076ZM11 3.65076H3V13.6508H11V3.65076ZM21 11.6508H13V21.6508H21V11.6508ZM11 15.6508H3V21.6508H11V15.6508Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_16_1466">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="translate(0 0.650757)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default DashboardIcon;
