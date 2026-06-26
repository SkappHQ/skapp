import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const TimeSheetIcon = ({
  fill = "black",
  width = "24",
  height = "25",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      z={1}
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_16_1481)">
        <path
          d="M15.0699 1.66077H9.06995V3.66077H15.0699V1.66077ZM11.0699 14.6608H13.0699V8.66077H11.0699V14.6608ZM19.0999 8.04077L20.5199 6.62077C20.0899 6.11077 19.6199 5.63077 19.1099 5.21077L17.6899 6.63077C16.1399 5.39077 14.1899 4.65077 12.0699 4.65077C7.09995 4.65077 3.06995 8.68077 3.06995 13.6508C3.06995 18.6208 7.08995 22.6508 12.0699 22.6508C17.0499 22.6508 21.0699 18.6208 21.0699 13.6508C21.0699 11.5408 20.3299 9.59077 19.0999 8.04077ZM12.0699 20.6608C8.19995 20.6608 5.06995 17.5308 5.06995 13.6608C5.06995 9.79077 8.19995 6.66077 12.0699 6.66077C15.9399 6.66077 19.0699 9.79077 19.0699 13.6608C19.0699 17.5308 15.9399 20.6608 12.0699 20.6608Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_16_1481">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="translate(0 0.650757)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default TimeSheetIcon;
