import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const PenIcon = ({
  fill = "black",
  width = "17",
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
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <g clipPath="url(#clip0_2878_712)">
        <path
          d="M9.70634 6.01333L10.3197 6.62667L4.27967 12.6667H3.66634V12.0533L9.70634 6.01333V6.01333ZM12.1063 2C11.9397 2 11.7663 2.06667 11.6397 2.19333L10.4197 3.41333L12.9197 5.91333L14.1397 4.69333C14.3997 4.43333 14.3997 4.01333 14.1397 3.75333L12.5797 2.19333C12.4463 2.06 12.2797 2 12.1063 2V2ZM9.70634 4.12667L2.33301 11.5V14H4.83301L12.2063 6.62667L9.70634 4.12667V4.12667Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_2878_712">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0.333008)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PenIcon;
