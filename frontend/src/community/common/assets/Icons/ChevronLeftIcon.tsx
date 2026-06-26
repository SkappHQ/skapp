import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const ChevronLeftIcon = ({
  fill = "#71717A",
  width = "7",
  height = "11",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 7 11"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M6.02551 9.22586L5.20967 10.0371L0.676757 5.49961L5.21426 0.962109L6.02551 1.77336L2.29926 5.49961L6.02551 9.22586Z"
        fill={fill}
      />
    </svg>
  );
};

export default ChevronLeftIcon;
