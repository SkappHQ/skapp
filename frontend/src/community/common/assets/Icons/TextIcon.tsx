import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const TextIcon = ({
  fill = "#3F3F46",
  width = "13",
  height = "13",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      {...svgProps}
    >
      <path
        d="M11.8 0L12.7667 3.625L11.9667 3.84167C11.5917 3.11667 11.2083 2.39167 10.7667 2.025C10.325 1.66667 9.80833 1.66667 9.3 1.66667H7.21667V10.4167C7.21667 10.8333 7.21667 11.25 7.49167 11.4583C7.775 11.6667 8.325 11.6667 8.88333 11.6667V12.5H3.88333V11.6667C4.44167 11.6667 4.99167 11.6667 5.275 11.4583C5.55 11.25 5.55 10.8333 5.55 10.4167V1.66667H3.46667C2.95833 1.66667 2.44167 1.66667 2 2.025C1.55833 2.39167 1.175 3.11667 0.8 3.84167L0 3.625L0.966667 0H11.8Z"
        fill={fill}
        style={{ fill: fill, fillOpacity: 1 }}
      />
    </svg>
  );
};

export default TextIcon;
