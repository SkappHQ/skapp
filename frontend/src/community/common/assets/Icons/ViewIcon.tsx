import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const ViewIcon = ({
  width = "16",
  height = "17",
  id,
  svgProps,
  fill = "black",
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M8 10.5C9.10457 10.5 10 9.60457 10 8.5C10 7.39543 9.10457 6.5 8 6.5C6.89543 6.5 6 7.39543 6 8.5C6 9.60457 6.89543 10.5 8 10.5Z"
        stroke={fill}
        strokeWidth="1.33333"
      />
      <path
        d="M13.4591 7.78933C13.7178 8.104 13.8471 8.26067 13.8471 8.5C13.8471 8.73933 13.7178 8.896 13.4591 9.21067C12.5125 10.36 10.4245 12.5 8.00048 12.5C5.57648 12.5 3.48848 10.36 2.54181 9.21067C2.28314 8.896 2.15381 8.73933 2.15381 8.5C2.15381 8.26067 2.28314 8.104 2.54181 7.78933C3.48848 6.64 5.57648 4.5 8.00048 4.5C10.4245 4.5 12.5125 6.64 13.4591 7.78933Z"
        stroke={fill}
        strokeWidth="1.33333"
      />
    </svg>
  );
};

export default ViewIcon;
