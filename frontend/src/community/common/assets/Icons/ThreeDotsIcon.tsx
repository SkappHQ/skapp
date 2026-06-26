import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const ThreeDotsIcon = ({
  fill = "black",
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
      <path
        d="M10.0003 10.8337C10.4606 10.8337 10.8337 10.4606 10.8337 10.0003C10.8337 9.54009 10.4606 9.16699 10.0003 9.16699C9.54009 9.16699 9.16699 9.54009 9.16699 10.0003C9.16699 10.4606 9.54009 10.8337 10.0003 10.8337Z"
        stroke={fill}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0003 4.99967C10.4606 4.99967 10.8337 4.62658 10.8337 4.16634C10.8337 3.7061 10.4606 3.33301 10.0003 3.33301C9.54009 3.33301 9.16699 3.7061 9.16699 4.16634C9.16699 4.62658 9.54009 4.99967 10.0003 4.99967Z"
        stroke={fill}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0001 16.6667C10.4603 16.6667 10.8334 16.2936 10.8334 15.8333C10.8334 15.3731 10.4603 15 10.0001 15C9.53984 15 9.16675 15.3731 9.16675 15.8333C9.16675 16.2936 9.53984 16.6667 10.0001 16.6667Z"
        stroke={fill}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ThreeDotsIcon;
