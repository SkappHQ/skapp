import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const ChevronRightIcon = ({
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
        d="M0.974493 9.22586L1.79033 10.0371L6.32324 5.49961L1.78574 0.962109L0.974493 1.77336L4.70074 5.49961L0.974493 9.22586Z"
        fill={fill}
      />
    </svg>
  );
};

export default ChevronRightIcon;
