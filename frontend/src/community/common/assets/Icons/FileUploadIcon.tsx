import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const FileUploadIcon = ({
  fill = "#71717A",
  width = "15",
  height = "17",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 15 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M4.5 13H10.5V7H14.5L7.5 0L0.5 7H4.5V13ZM0.5 15H14.5V17H0.5V15Z"
        fill={fill}
      />
    </svg>
  );
};
export default FileUploadIcon;
