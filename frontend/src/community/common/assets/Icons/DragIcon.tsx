import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const DragIcon = ({
  fill = "#71717A",
  width = "24",
  height = "24",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_1835_26949)">
        <path
          d="M11 18.001C11 19.101 10.1 20.001 9 20.001C7.9 20.001 7 19.101 7 18.001C7 16.901 7.9 16.001 9 16.001C10.1 16.001 11 16.901 11 18.001ZM9 10.001C7.9 10.001 7 10.901 7 12.001C7 13.101 7.9 14.001 9 14.001C10.1 14.001 11 13.101 11 12.001C11 10.901 10.1 10.001 9 10.001ZM9 4.00098C7.9 4.00098 7 4.90098 7 6.00098C7 7.10098 7.9 8.00098 9 8.00098C10.1 8.00098 11 7.10098 11 6.00098C11 4.90098 10.1 4.00098 9 4.00098ZM15 8.00098C16.1 8.00098 17 7.10098 17 6.00098C17 4.90098 16.1 4.00098 15 4.00098C13.9 4.00098 13 4.90098 13 6.00098C13 7.10098 13.9 8.00098 15 8.00098ZM15 10.001C13.9 10.001 13 10.901 13 12.001C13 13.101 13.9 14.001 15 14.001C16.1 14.001 17 13.101 17 12.001C17 10.901 16.1 10.001 15 10.001ZM15 16.001C13.9 16.001 13 16.901 13 18.001C13 19.101 13.9 20.001 15 20.001C16.1 20.001 17 19.101 17 18.001C17 16.901 16.1 16.001 15 16.001Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_1835_26949">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="translate(0 0.000976562)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default DragIcon;
