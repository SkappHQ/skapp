import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CheckCircleOutlineIcon = ({
  fill = "#2A61A0",
  width = "25",
  height = "24",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M22.666 11.0799V11.9999C22.6648 14.1563 21.9665 16.2545 20.6754 17.9817C19.3842 19.7088 17.5693 20.9723 15.5014 21.5838C13.4334 22.1952 11.2233 22.1218 9.20049 21.3744C7.1777 20.6271 5.45067 19.246 4.27698 17.4369C3.10328 15.6279 2.54581 13.4879 2.68769 11.3362C2.82958 9.18443 3.66322 7.13619 5.0643 5.49694C6.46537 3.85768 8.3588 2.71525 10.4622 2.24001C12.5656 1.76477 14.7663 1.9822 16.736 2.85986"
        stroke={fill}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          stroke: fill,
          strokeOpacity: 1
        }}
      />
      <path
        d="M22.666 4L12.666 14.01L9.66602 11.01"
        stroke={fill}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          stroke: fill,
          strokeOpacity: 1
        }}
      />
    </svg>
  );
};

export default CheckCircleOutlineIcon;
