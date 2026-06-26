import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const SuperAdminIcon = ({
  width = "17",
  height = "22",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 17 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M8.4 0.5L0 4.31818V10.0455C0 15.3432 3.584 20.2973 8.4 21.5C13.216 20.2973 16.8 15.3432 16.8 10.0455V4.31818L8.4 0.5ZM11.2747 14.8182L8.4 13.0523L5.53467 14.8182L6.29067 11.4773L3.76133 9.24364L7.10267 8.94773L8.4 5.79773L9.69733 8.93818L13.0387 9.23409L10.5093 11.4773L11.2747 14.8182Z"
        fill="url(#paint0_linear_983_75677)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_983_75677"
          x1="8.4"
          y1="0.5"
          x2="8.4"
          y2="21.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F8DD06" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SuperAdminIcon;
