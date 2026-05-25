import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const RoundPhoneIcon = ({
  fill = "white",
  backgroundFill = "#00BBA7",
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
      <path
        opacity="0.3"
        d="M11.4998 12.915C12.1448 13.185 12.8148 13.36 13.4998 13.45V12.335L12.3248 12.1L11.4998 12.915ZM7.6648 6.5H6.5498C6.6398 7.185 6.8148 7.85 7.0848 8.5L7.8998 7.675L7.6648 6.5Z"
        fill={fill}
      />
      <path
        d="M14.1002 11.435L12.2652 11.07C12.0152 11.02 11.8502 11.17 11.8152 11.205L10.5552 12.455C9.30519 11.74 8.27019 10.705 7.55519 9.455L8.80519 8.195C8.92019 8.075 8.97019 7.91 8.94019 7.745L8.56519 5.9C8.52019 5.67 8.31519 5.5 8.07519 5.5H6.00019C5.72019 5.5 5.48519 5.735 5.50019 6.015C5.58519 7.46 6.02519 8.815 6.71519 10C7.50519 11.365 8.64019 12.495 10.0002 13.285C11.1852 13.97 12.5402 14.415 13.9852 14.5C14.2602 14.515 14.5002 14.285 14.5002 14V11.925C14.5002 11.685 14.3302 11.48 14.1002 11.435ZM6.55019 6.5H7.66519L7.90019 7.675L7.08519 8.5C6.81519 7.85 6.63519 7.185 6.55019 6.5ZM13.5002 13.45C12.8152 13.36 12.1502 13.185 11.5002 12.915L12.3252 12.1L13.5002 12.335V13.45Z"
        fill={fill}
      />
    </svg>
  );
};

export default RoundPhoneIcon;
