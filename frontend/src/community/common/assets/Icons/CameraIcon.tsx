import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CameraIcon = ({
  width = "24",
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
        stroke="#71717A"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        clipPath="url(#a)"
      >
        <path d="M23.5 19a2 2 0 0 1-2 2h-18a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11Z" />
        <path d="M12.5 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M.5 0h24v24H.5z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CameraIcon;
