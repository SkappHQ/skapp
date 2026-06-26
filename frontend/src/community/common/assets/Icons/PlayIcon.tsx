import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const PlayIcon = ({
  fill = "white",
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
      viewBox="0 0 8 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path d="M0 0V14L11 7L0 0Z" fill={fill} />
    </svg>
  );
};

export default PlayIcon;
