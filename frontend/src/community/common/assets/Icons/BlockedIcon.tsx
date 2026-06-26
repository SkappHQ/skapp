import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const BlockedIcon = ({
  fill = "#7F1D1D",
  width = "17",
  height = "18",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 17 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M8.49984 0.666016C3.89984 0.666016 0.166504 4.39935 0.166504 8.99935C0.166504 13.5993 3.89984 17.3327 8.49984 17.3327C13.0998 17.3327 16.8332 13.5993 16.8332 8.99935C16.8332 4.39935 13.0998 0.666016 8.49984 0.666016ZM8.49984 15.666C4.8165 15.666 1.83317 12.6827 1.83317 8.99935C1.83317 7.45768 2.35817 6.04102 3.2415 4.91602L12.5832 14.2577C11.4582 15.141 10.0415 15.666 8.49984 15.666ZM13.7582 13.0827L4.4165 3.74102C5.5415 2.85768 6.95817 2.33268 8.49984 2.33268C12.1832 2.33268 15.1665 5.31602 15.1665 8.99935C15.1665 10.541 14.6415 11.9577 13.7582 13.0827Z"
        fill={fill}
      />
    </svg>
  );
};

export default BlockedIcon;
