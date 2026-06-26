import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const LockIcon = ({
  fill = "black",
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
      <g clipPath="url(#clip0_4703_6948)">
        <path
          d="M12.0003 5.33366H11.3337V4.00033C11.3337 2.16033 9.84032 0.666992 8.00033 0.666992C6.16033 0.666992 4.66699 2.16033 4.66699 4.00033V5.33366H4.00033C3.26699 5.33366 2.66699 5.93366 2.66699 6.66699V13.3337C2.66699 14.067 3.26699 14.667 4.00033 14.667H12.0003C12.7337 14.667 13.3337 14.067 13.3337 13.3337V6.66699C13.3337 5.93366 12.7337 5.33366 12.0003 5.33366ZM6.00033 4.00033C6.00033 2.89366 6.89366 2.00033 8.00033 2.00033C9.10699 2.00033 10.0003 2.89366 10.0003 4.00033V5.33366H6.00033V4.00033ZM12.0003 13.3337H4.00033V6.66699H12.0003V13.3337ZM8.00033 11.3337C8.73366 11.3337 9.33366 10.7337 9.33366 10.0003C9.33366 9.26699 8.73366 8.66699 8.00033 8.66699C7.26699 8.66699 6.66699 9.26699 6.66699 10.0003C6.66699 10.7337 7.26699 11.3337 8.00033 11.3337Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_4703_6948">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default LockIcon;
