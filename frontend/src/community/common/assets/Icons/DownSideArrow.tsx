import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const DownSideArrow = ({
  fill = "black",
  width = "15",
  height = "14",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M14.1666 6.99967L12.9916 5.82467L8.33325 10.4747V0.333008H6.66658V10.4747L2.01659 5.81634L0.833252 6.99967L7.49992 13.6663L14.1666 6.99967Z"
        fill={fill}
      />
    </svg>
  );
};

export default DownSideArrow;
