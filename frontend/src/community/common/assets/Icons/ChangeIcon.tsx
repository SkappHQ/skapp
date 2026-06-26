import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const ChangeIcon = ({
  fill = "black",
  width = "21",
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
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_463_2646)">
        <path
          d="M10.5 3.33334V0.833344L7.16665 4.16668L10.5 7.50001V5.00001C13.2583 5.00001 15.5 7.24168 15.5 10C15.5 10.8417 15.2916 11.6417 14.9166 12.3333L16.1333 13.55C16.7833 12.525 17.1666 11.3083 17.1666 10C17.1666 6.31668 14.1833 3.33334 10.5 3.33334ZM10.5 15C7.74165 15 5.49998 12.7583 5.49998 10C5.49998 9.15834 5.70831 8.35834 6.08331 7.66668L4.86665 6.45001C4.21665 7.47501 3.83331 8.69168 3.83331 10C3.83331 13.6833 6.81665 16.6667 10.5 16.6667V19.1667L13.8333 15.8333L10.5 12.5V15Z"
          fill={fill}
          style={{ fill: "black", fillOpacity: 1 }}
        />
      </g>
      <defs>
        <clipPath id="clip0_463_2646">
          <rect
            width="20"
            height="20"
            fill="white"
            style={{ fill: "white", fillOpacity: 1 }}
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ChangeIcon;
