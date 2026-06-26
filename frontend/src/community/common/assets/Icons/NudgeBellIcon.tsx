import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const NudgeBellIcon = ({
  fill = "#78350F",
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
      <g clipPath="url(#clip0_1339_1734)">
        <path
          d="M10.5002 18.3333C11.4169 18.3333 12.1669 17.5833 12.1669 16.6666H8.83356C8.83356 17.5833 9.58356 18.3333 10.5002 18.3333ZM15.5002 13.3333V9.16658C15.5002 6.60825 14.1419 4.46659 11.7502 3.89992V3.33325C11.7502 2.64159 11.1919 2.08325 10.5002 2.08325C9.80856 2.08325 9.25023 2.64159 9.25023 3.33325V3.89992C6.86689 4.46659 5.50023 6.59992 5.50023 9.16658V13.3333L3.83356 14.9999V15.8333H17.1669V14.9999L15.5002 13.3333ZM13.8336 14.1666H7.16689V9.16658C7.16689 7.09992 8.42523 5.41659 10.5002 5.41659C12.5752 5.41659 13.8336 7.09992 13.8336 9.16658V14.1666ZM6.81689 3.39992L5.62523 2.20825C3.62523 3.73325 2.30856 6.08325 2.19189 8.74992H3.85856C3.98356 6.54158 5.11689 4.60825 6.81689 3.39992ZM17.1419 8.74992H18.8086C18.6836 6.08325 17.3669 3.73325 15.3752 2.20825L14.1919 3.39992C15.8752 4.60825 17.0169 6.54158 17.1419 8.74992Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_1339_1734">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default NudgeBellIcon;
