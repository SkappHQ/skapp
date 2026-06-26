import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const PopOutIcon = ({
  fill = "#71717A",
  width = "25",
  height = "25",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M18.1907 13.5V19.5C18.1907 20.0304 17.98 20.5391 17.6049 20.9142C17.2298 21.2893 16.7211 21.5 16.1907 21.5H5.19067C4.66024 21.5 4.15153 21.2893 3.77646 20.9142C3.40139 20.5391 3.19067 20.0304 3.19067 19.5V8.5C3.19067 7.96957 3.40139 7.46086 3.77646 7.08579C4.15153 6.71071 4.66024 6.5 5.19067 6.5H11.1907"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.1907 3.5H21.1907V9.5"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.1907 14.5L21.1907 3.5"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PopOutIcon;
