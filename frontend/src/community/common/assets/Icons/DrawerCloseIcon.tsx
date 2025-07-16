import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const DrawerCloseIcon = ({
  width = "24",
  height = "25",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M19 3.77539H5C3.89543 3.77539 3 4.67082 3 5.77539V19.7754C3 20.88 3.89543 21.7754 5 21.7754H19C20.1046 21.7754 21 20.88 21 19.7754V5.77539C21 4.67082 20.1046 3.77539 19 3.77539Z"
        stroke="#71717A"
        style={{ stroke: "#71717A", strokeOpacity: 1 }}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 3.77539V21.7754"
        stroke="#71717A"
        style={{ stroke: "#71717A", strokeOpacity: 1 }}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DrawerCloseIcon;
