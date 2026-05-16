import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const EmailIcon = ({
  fill = "#68707F",
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
        d="M3.33341 3.33301H16.6667C17.5834 3.33301 18.3334 4.08301 18.3334 4.99967V14.9997C18.3334 15.9163 17.5834 16.6663 16.6667 16.6663H3.33341C2.41675 16.6663 1.66675 15.9163 1.66675 14.9997V4.99967C1.66675 4.08301 2.41675 3.33301 3.33341 3.33301Z"
        stroke={fill}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3334 5L10.0001 10.8333L1.66675 5"
        stroke={fill}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EmailIcon;
