import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const DeleteButtonIcon = ({
  fill = "black",
  width = "12",
  height = "16",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 12 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M0.999349 13.8333C0.999349 14.75 1.74935 15.5 2.66602 15.5H9.33268C10.2493 15.5 10.9993 14.75 10.9993 13.8333V3.83333H0.999349V13.8333ZM2.66602 5.5H9.33268V13.8333H2.66602V5.5ZM8.91602 1.33333L8.08268 0.5H3.91602L3.08268 1.33333H0.166016V3H11.8327V1.33333H8.91602Z"
        fill={fill}
      />
    </svg>
  );
};

export default DeleteButtonIcon;
