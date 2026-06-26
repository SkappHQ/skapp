import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const TimerIcon = ({
  fill = "#3F3F46",
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
      <g clipPath="url(#clip0_2668_5901)">
        <path
          d="M10.0466 0.672852H6.04663V2.00618H10.0466V0.672852ZM7.37996 9.33952H8.7133V5.33952H7.37996V9.33952ZM12.7333 4.92618L13.68 3.97952C13.3933 3.63952 13.08 3.31952 12.74 3.03952L11.7933 3.98618C10.76 3.15952 9.45996 2.66618 8.04663 2.66618C4.7333 2.66618 2.04663 5.35285 2.04663 8.66618C2.04663 11.9795 4.72663 14.6662 8.04663 14.6662C11.3666 14.6662 14.0466 11.9795 14.0466 8.66618C14.0466 7.25952 13.5533 5.95952 12.7333 4.92618ZM8.04663 13.3395C5.46663 13.3395 3.37996 11.2529 3.37996 8.67285C3.37996 6.09285 5.46663 4.00618 8.04663 4.00618C10.6266 4.00618 12.7133 6.09285 12.7133 8.67285C12.7133 11.2529 10.6266 13.3395 8.04663 13.3395Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_2668_5901">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default TimerIcon;
