import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CrossedCircleIcon = ({
  fill = "#2A61A0",
  width = "24",
  height = "25",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      z={1}
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M18.8964 5.3889C22.8237 9.31627 22.8237 15.6839 18.8964 19.6112C14.969 23.5385 8.60143 23.5385 4.67404 19.6112C0.746673 15.6839 0.746673 9.31627 4.67404 5.3889C8.60143 1.46151 14.969 1.46151 18.8964 5.3889ZM18.8964 5.3889L4.67514 19.6101"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CrossedCircleIcon;
