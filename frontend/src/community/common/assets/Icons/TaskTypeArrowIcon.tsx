import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const TaskTypeArrowIcon = ({
  fill = "#71717A",
  width = "24",
  height = "24",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => (
  <svg
    id={id}
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
    aria-hidden="true"
    {...svgProps}
  >
    <path d="M7 10L12 15L17 10H7Z" fill={fill} />
  </svg>
);

export default TaskTypeArrowIcon;
