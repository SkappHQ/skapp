import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const RingBellIcon = ({
  fill = "#2A61A0",
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
      <g clipPath="url(#clip0)">
        <path
          d="M8.00018 14.666C8.73352 14.666 9.33352 14.066 9.33352 13.3327H6.66685C6.66685 14.066 7.26685 14.666 8.00018 14.666ZM12.0002 10.666V7.33268C12.0002 5.28602 10.9135 3.57268 9.00018 3.11935V2.66602C9.00018 2.11268 8.55352 1.66602 8.00018 1.66602C7.44685 1.66602 7.00018 2.11268 7.00018 2.66602V3.11935C5.09352 3.57268 4.00018 5.27935 4.00018 7.33268V10.666L2.66685 11.9993V12.666H13.3335V11.9993L12.0002 10.666ZM10.6668 11.3327H5.33352V7.33268C5.33352 5.67935 6.34018 4.33268 8.00018 4.33268C9.66018 4.33268 10.6668 5.67935 10.6668 7.33268V11.3327ZM5.05352 2.71935L4.10018 1.76602C2.50018 2.98602 1.44685 4.86602 1.35352 6.99935H2.68685C2.78685 5.23268 3.69352 3.68602 5.05352 2.71935ZM13.3135 6.99935H14.6468C14.5468 4.86602 13.4935 2.98602 11.9002 1.76602L10.9535 2.71935C12.3002 3.68602 13.2135 5.23268 13.3135 6.99935Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default RingBellIcon;
