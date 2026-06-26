import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const SaveIcon = ({
  fill = "#27272A",
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
      <g clipPath="url(#clip0_2455_5912)">
        <path
          d="M14.1667 2.5H4.16667C3.24167 2.5 2.5 3.25 2.5 4.16667V15.8333C2.5 16.75 3.24167 17.5 4.16667 17.5H15.8333C16.75 17.5 17.5 16.75 17.5 15.8333V5.83333L14.1667 2.5ZM15.8333 15.8333H4.16667V4.16667H13.475L15.8333 6.525V15.8333ZM10 10C8.61667 10 7.5 11.1167 7.5 12.5C7.5 13.8833 8.61667 15 10 15C11.3833 15 12.5 13.8833 12.5 12.5C12.5 11.1167 11.3833 10 10 10ZM5 5H12.5V8.33333H5V5Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_2455_5912">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default SaveIcon;
