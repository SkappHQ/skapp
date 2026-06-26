import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const PeopleIcon = ({
  fill = "#1E1E1E",
  width = "24",
  height = "25",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      z={1}
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_16_1509)">
        <path
          d="M9 14.4008C6.66 14.4008 2 15.5708 2 17.9008V19.6508H16V17.9008C16 15.5708 11.34 14.4008 9 14.4008ZM4.34 17.6508C5.18 17.0708 7.21 16.4008 9 16.4008C10.79 16.4008 12.82 17.0708 13.66 17.6508H4.34ZM9 12.6508C10.93 12.6508 12.5 11.0808 12.5 9.15076C12.5 7.22076 10.93 5.65076 9 5.65076C7.07 5.65076 5.5 7.22076 5.5 9.15076C5.5 11.0808 7.07 12.6508 9 12.6508ZM9 7.65076C9.83 7.65076 10.5 8.32076 10.5 9.15076C10.5 9.98076 9.83 10.6508 9 10.6508C8.17 10.6508 7.5 9.98076 7.5 9.15076C7.5 8.32076 8.17 7.65076 9 7.65076ZM16.04 14.4608C17.2 15.3008 18 16.4208 18 17.9008V19.6508H22V17.9008C22 15.8808 18.5 14.7308 16.04 14.4608ZM15 12.6508C16.93 12.6508 18.5 11.0808 18.5 9.15076C18.5 7.22076 16.93 5.65076 15 5.65076C14.46 5.65076 13.96 5.78076 13.5 6.00076C14.13 6.89076 14.5 7.98076 14.5 9.15076C14.5 10.3208 14.13 11.4108 13.5 12.3008C13.96 12.5208 14.46 12.6508 15 12.6508Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_16_1509">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="translate(0 0.650757)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PeopleIcon;
