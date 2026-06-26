import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CloseStatusPopupIcon = ({
  fill = "black",
  backgroundFill = "#E4E4E7",
  width = "36",
  height = "36",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <rect width={width} height={height} rx="18" fill={backgroundFill} />
      <path
        d="M24 13.2086L22.7914 12L18 16.7914L13.2086 12L12 13.2086L16.7914 18L12 22.7914L13.2086 24L18 19.2086L22.7914 24L24 22.7914L19.2086 18L24 13.2086Z"
        fill={fill}
      />
    </svg>
  );
};

export default CloseStatusPopupIcon;
