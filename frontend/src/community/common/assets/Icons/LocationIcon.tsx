import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const LocationIcon = ({
  fill = "black",
  width = "20",
  height = "20"
}: IconProps): JSX.Element => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_location)">
        <path
          d="M9.99984 3.33366C11.6082 3.33366 14.1665 4.50033 14.1665 7.62533C14.1665 9.42532 12.7332 11.517 9.99984 13.7253C7.2665 11.517 5.83317 9.41699 5.83317 7.62533C5.83317 4.50033 8.3915 3.33366 9.99984 3.33366ZM9.99984 1.66699C7.27484 1.66699 4.1665 3.71699 4.1665 7.62533C4.1665 10.2253 6.10817 12.967 9.99984 15.8337C13.8915 12.967 15.8332 10.2253 15.8332 7.62533C15.8332 3.71699 12.7248 1.66699 9.99984 1.66699Z"
          fill={fill}
        />
        <path
          d="M9.99984 5.83301C9.08317 5.83301 8.33317 6.58301 8.33317 7.49967C8.33317 8.41634 9.08317 9.16634 9.99984 9.16634C10.4419 9.16634 10.8658 8.99075 11.1783 8.67819C11.4909 8.36562 11.6665 7.9417 11.6665 7.49967C11.6665 7.05765 11.4909 6.63372 11.1783 6.32116C10.8658 6.0086 10.4419 5.83301 9.99984 5.83301ZM4.1665 16.6663H15.8332V18.333H4.1665V16.6663Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_location">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default LocationIcon;
