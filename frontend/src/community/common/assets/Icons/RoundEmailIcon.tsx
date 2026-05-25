import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const RoundEmailIcon = ({
  fill = "white",
  backgroundFill = "#8E51FF",
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
      style={{
        width: typeof width === "number" || !isNaN(Number(width)) ? `${width}px` : width,
        height: typeof height === "number" || !isNaN(Number(height)) ? `${height}px` : height,
        ...svgProps?.style
      }}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <rect width="20" height="20" rx="10" fill={backgroundFill} />
      <path d="M10 10.5L6 8V13H14V8L10 10.5Z" fill={fill} fillOpacity="0.3" />
      <path
        d="M6 6.5H14C14.275 6.5 14.5 6.725 14.5 7V13C14.5 13.275 14.275 13.5 14 13.5H6C5.725 13.5 5.5 13.275 5.5 13V7C5.5 6.725 5.725 6.5 6 6.5Z"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 7.25L10 10L14.5 7.25"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RoundEmailIcon;
