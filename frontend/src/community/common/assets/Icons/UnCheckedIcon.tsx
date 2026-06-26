import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const UnCheckedIcon = ({
  fill = "#FCA5A5",
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
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <circle cx="12" cy="12" r="9" stroke={fill} strokeWidth="2" />
    </svg>
  );
};

export default UnCheckedIcon;
