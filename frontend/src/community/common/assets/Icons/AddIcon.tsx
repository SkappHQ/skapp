import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const AddIcon = ({
  fill = "black",
  width = "13",
  height = "12",
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
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M12.3332 6.83317H7.33317V11.8332H5.6665V6.83317H0.666504V5.1665H5.6665V0.166504H7.33317V5.1665H12.3332V6.83317Z"
        fill={fill}
      />
    </svg>
  );
};

export default AddIcon;
