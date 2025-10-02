import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const WarningAlertIcon = ({
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
      <g
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        clipPath="url(#a)"
      >
        <path d="M10.456 3.86 1.986 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3l-8.47-14.14a1.999 1.999 0 0 0-3.42 0v0ZM12.166 9v4M12.166 17h.01" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M.166 0h24v24h-24z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default WarningAlertIcon;
