import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const MailIcon = ({
  fill = "#3F3F46",
  height = "16",
  width = "16",
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
      <g clipPath="url(#clip0_2668_3950)">
        <path
          d="M14.6666 4.00033C14.6666 3.26699 14.0666 2.66699 13.3333 2.66699H2.66659C1.93325 2.66699 1.33325 3.26699 1.33325 4.00033V12.0003C1.33325 12.7337 1.93325 13.3337 2.66659 13.3337H13.3333C14.0666 13.3337 14.6666 12.7337 14.6666 12.0003V4.00033ZM13.3333 4.00033L7.99992 7.32699L2.66659 4.00033H13.3333ZM13.3333 12.0003H2.66659V5.33366L7.99992 8.66699L13.3333 5.33366V12.0003Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_2668_3950">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default MailIcon;
