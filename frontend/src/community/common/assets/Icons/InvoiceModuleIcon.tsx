import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const InvoiceModuleIcon = ({
  fill = "#2A61A0",
  width = "38",
  height = "40",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 128 89"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <rect
        x="3.65921"
        y="2.83938"
        width="110.532"
        height="74.8776"
        rx="7.26292"
        stroke={fill}
        strokeWidth="5.58686"
      />
      <rect
        x="19.6021"
        y="16.0762"
        width="104.945"
        height="69.2907"
        rx="4.46949"
        fill="white"
        stroke={fill}
        strokeWidth="6.70424"
      />
      <path
        d="M32.7512 40.3681C43.4808 39.9599 45.8833 36.8847 45.9287 28.0273H97.3838C98.2378 37.191 100.148 41.2112 111.398 42.2506V61.9123C102.054 61.7077 98.9103 64.1882 97.3838 73.4165H45.9287C45.805 64.4347 43.059 61.4768 32.7512 60.4481V40.3681Z"
        fill="#EF8D42"
        stroke="#D64550"
        strokeWidth="5.58686"
        strokeLinejoin="round"
      />
      <circle cx="72.0746" cy="50.7208" r="6.18952" fill="white" />
    </svg>
  );
};

export default InvoiceModuleIcon;
