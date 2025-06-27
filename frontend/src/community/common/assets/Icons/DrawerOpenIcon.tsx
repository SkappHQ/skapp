import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const DrawerOpenIcon = ({
  width = "24",
  height = "24",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
        stroke="#71717A"
        style={{ stroke: "#71717A", strokeOpacity: 1 }}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 3V21M14 9L17 12L14 15"
        stroke="#71717A"
        style={{ stroke: "#71717A", strokeOpacity: 1 }}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DrawerOpenIcon;
