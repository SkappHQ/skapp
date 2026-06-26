import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const DashIcon = ({
  fill = "black",
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
      onClick={onClick}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <g opacity="0.6">
        <path
          d="M12.3586 6.28V8.128H2.78263V6.28H12.3586Z"
          fill="black"
          style={{
            fill: fill,
            fillOpacity: 1
          }}
        />
      </g>
    </svg>
  );
};

export default DashIcon;
