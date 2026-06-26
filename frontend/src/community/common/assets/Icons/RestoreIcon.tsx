import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const RestoreIcon = ({
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
      <g clipPath="url(#clip0_2433_6154)">
        <path
          d="M10.834 2.5C6.69232 2.5 3.33398 5.85833 3.33398 10H0.833984L4.16732 13.325L7.50065 10H5.00065C5.00065 6.775 7.60898 4.16667 10.834 4.16667C14.059 4.16667 16.6673 6.775 16.6673 10C16.6673 13.225 14.059 15.8333 10.834 15.8333C9.22565 15.8333 7.76732 15.175 6.71732 14.1167L5.53398 15.3C6.89232 16.6583 8.75898 17.5 10.834 17.5C14.9757 17.5 18.334 14.1417 18.334 10C18.334 5.85833 14.9757 2.5 10.834 2.5ZM10.0007 6.66667V10.8333L13.5423 12.9333L14.184 11.8667L11.2507 10.125V6.66667H10.0007Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_2433_6154">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default RestoreIcon;
