import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const RotateLeftIcon = ({
  fill = "black",
  width = "16",
  height = "17",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_4653_6893)">
        <path
          d="M4.74002 6.18699L3.80001 5.24033C3.20001 6.01366 2.82668 6.90699 2.71335 7.83366H4.06002C4.15335 7.25366 4.38668 6.68699 4.74002 6.18699ZM4.06002 9.16699H2.71335C2.82668 10.0937 3.19335 10.987 3.79335 11.7603L4.73335 10.8137C4.38668 10.3137 4.15335 9.75366 4.06002 9.16699ZM4.73335 12.7137C5.50668 13.3137 6.40668 13.6737 7.33335 13.787V12.4337C6.75335 12.3337 6.19335 12.107 5.69335 11.747L4.73335 12.7137ZM8.66668 3.21366V1.16699L5.63335 4.20033L8.66668 7.16699V4.56033C10.56 4.88033 12 6.52033 12 8.50033C12 10.4803 10.56 12.1203 8.66668 12.4403V13.787C11.3 13.4603 13.3333 11.2203 13.3333 8.50033C13.3333 5.78033 11.3 3.54033 8.66668 3.21366Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_4653_6893">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default RotateLeftIcon;
