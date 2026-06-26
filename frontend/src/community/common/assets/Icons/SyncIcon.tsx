import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const SyncIcon = ({
  fill = "#78350F",
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
      <g clipPath="url(#clip0_4540_5000)">
        <path
          d="M18.3333 6.66683L15 3.3335V5.8335H2.5V7.50016H15V10.0002L18.3333 6.66683Z"
          fill={fill}
        />
        <path
          d="M1.66602 13.3333L4.99935 16.6667V14.1667H17.4993V12.5H4.99935V10L1.66602 13.3333Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_4540_5000">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default SyncIcon;
