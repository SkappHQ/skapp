import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const BackArrowIcon = ({
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
      <g clipPath="url(#clip0_8742_31733)">
        <path
          d="M14.5922 3.225L13.1089 1.75L4.86719 10L13.1172 18.25L14.5922 16.775L7.81719 10L14.5922 3.225Z"
          fill={fill}
          style={{ fill: fill, fillOpacity: 1 }}
        />
      </g>
      <defs>
        <clipPath id="clip0_8742_31733">
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

export default BackArrowIcon;
