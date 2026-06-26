import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const GemIcon = ({
  fill = "#2A61A0",
  width = "15",
  height = "12",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 15 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M12.1673 0H2.83398L0.833984 4L7.50065 12L14.1673 4L12.1673 0ZM11.3407 1.33333L12.3407 3.33333H10.574L9.57399 1.33333H11.3407ZM3.66065 1.33333H5.42732L4.42732 3.33333H2.66065L3.66065 1.33333ZM6.83399 9.12L3.12732 4.66667H6.83399V9.12ZM5.91398 3.33333L6.91399 1.33333H8.08732L9.08732 3.33333H5.91398ZM8.16732 9.12V4.66667H11.874L8.16732 9.12Z"
        fill={fill}
      />
    </svg>
  );
};

export default GemIcon;
