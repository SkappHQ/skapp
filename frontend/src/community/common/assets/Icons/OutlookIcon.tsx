import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const OutlookIcon = ({
  width = "36",
  height = "36",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_9344_59870)">
        <path d="M17.1093 17.1093H0V0H17.1093V17.1093Z" fill="#F1511B" />
        <path d="M35.9988 17.1093H18.8896V0H35.9988V17.1093Z" fill="#80CC28" />
        <path d="M17.1089 36.0019H0V18.8926H17.1089V36.0019Z" fill="#00ADEF" />
        <path
          d="M35.9988 36.0019H18.8896V18.8926H35.9988V36.0019Z"
          fill="#FBBC09"
        />
      </g>
      <defs>
        <clipPath id="clip0_9344_59870">
          <rect width="36" height="36" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default OutlookIcon;
