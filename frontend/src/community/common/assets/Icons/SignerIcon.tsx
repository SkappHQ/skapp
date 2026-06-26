import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const SignerIcon = ({
  width = "16",
  height = "16",
  id,
  svgProps,
  fill = "black",
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_1835_26990)">
        <path
          d="M8 12.6676L12.6667 8.00098L14.6667 10.001L10 14.6676L8 12.6676Z"
          stroke={fill}
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.0002 8.66732L11.0002 3.66732L1.3335 1.33398L3.66683 11.0007L8.66683 12.0007L12.0002 8.66732Z"
          stroke={fill}
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.3335 1.33398L6.39083 6.39132"
          stroke={fill}
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.33333 8.66764C8.06971 8.66764 8.66667 8.07069 8.66667 7.33431C8.66667 6.59793 8.06971 6.00098 7.33333 6.00098C6.59695 6.00098 6 6.59793 6 7.33431C6 8.07069 6.59695 8.66764 7.33333 8.66764Z"
          stroke={fill}
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1835_26990">
          <rect
            width="16"
            height="16"
            fill="white"
            // style={{
            //   fill: "white",
            //   fillOpacity: 1
            // }}
            transform="translate(0 0.000976562)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default SignerIcon;
