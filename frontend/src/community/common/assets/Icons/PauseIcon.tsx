import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const PauseIcon = ({
  fill = "white",
  width = "12",
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
      viewBox="0 0 12 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path d="M0 14H4V0H0V14ZM8 0V14H12V0H8Z" fill={fill} />
    </svg>
  );
};

export default PauseIcon;
