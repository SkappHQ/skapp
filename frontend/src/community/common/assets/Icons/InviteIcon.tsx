import { JSX } from "react";

import { theme } from "~community/common/theme/theme";
import { IconProps } from "~community/common/types/IconTypes";

const InviteIcon = ({
  fill = theme.palette.grey[800],
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
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M14.6673 1.83398L7.33398 9.16732"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6673 1.83398L10.0007 15.1673L7.33398 9.16732L1.33398 6.50065L14.6673 1.83398Z"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default InviteIcon;
