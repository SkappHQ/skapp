import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const RequestCancelCrossIcon = ({
  fill = "black",
  width = "16",
  height = "16",
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
      <g clipPath="url(#clip0_1401_677)">
        <path
          d="M15.8332 5.34175L14.6582 4.16675L9.99984 8.82508L5.3415 4.16675L4.1665 5.34175L8.82484 10.0001L4.1665 14.6584L5.3415 15.8334L9.99984 11.1751L14.6582 15.8334L15.8332 14.6584L11.1748 10.0001L15.8332 5.34175Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_1401_677">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default RequestCancelCrossIcon;
