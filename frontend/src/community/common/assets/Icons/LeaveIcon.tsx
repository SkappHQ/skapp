import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const LeaveIcon = ({
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
      <path
        d="M4.78 7.13739L8 8.00006L11.22 8.86273L14.4397 9.72573C15.219 6.81673 13.9493 3.84206 11.5153 2.33339C10.9598 1.98951 10.3566 1.72917 9.72534 1.56073C9.0007 1.36576 8.24835 1.29454 7.5 1.35006C4.75434 1.55673 2.31334 3.46406 1.56067 6.27439L4.78 7.13739Z"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.42432 7.30964C5.42432 7.30964 5.69465 5.65664 6.76998 4.2193C7.84532 2.78197 9.72532 1.5603 9.72532 1.5603C9.72532 1.5603 10.743 3.55864 10.9556 5.34097C11.1683 7.1233 10.5756 8.6903 10.5756 8.6903"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.56065 6.27478L4.78031 7.13745L7.99998 8.00012M7.99998 8.00012L11.2193 8.86278L14.4393 9.72578M7.99998 8.00012L6.16665 14.6668M1.33331 14.6668H14.6666M7.49998 1.35045C8.24829 1.29471 9.00064 1.36571 9.72531 1.56045C10.3567 1.7291 10.9598 1.98967 11.5153 2.33378"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LeaveIcon;
