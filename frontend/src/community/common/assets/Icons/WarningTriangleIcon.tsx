import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const WarningTriangleIcon = ({
  fill = "var(--color-primary-text)",
  width = "16",
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
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M8.00008 3.9935L13.0201 12.6668H2.98008L8.00008 3.9935ZM8.00008 1.3335L0.666748 14.0002H15.3334L8.00008 1.3335ZM8.66675 10.6668H7.33342V12.0002H8.66675V10.6668ZM8.66675 6.66683H7.33342V9.3335H8.66675V6.66683Z"
        fill={fill}
      />
    </svg>
  );
};

export default WarningTriangleIcon;
