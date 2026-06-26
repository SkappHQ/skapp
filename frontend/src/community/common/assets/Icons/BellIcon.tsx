import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const BellIcon = ({
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
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M15.9997 27.7812C17.3288 27.7812 18.4163 26.6938 18.4163 25.3646H13.583C13.583 26.0055 13.8376 26.6202 14.2908 27.0734C14.744 27.5266 15.3587 27.7812 15.9997 27.7812ZM23.2497 20.5312V14.4896C23.2497 10.78 21.268 7.67458 17.8122 6.85292V6.03125C17.8122 5.02833 17.0026 4.21875 15.9997 4.21875C14.9968 4.21875 14.1872 5.02833 14.1872 6.03125V6.85292C10.7193 7.67458 8.74967 10.7679 8.74967 14.4896V20.5312L6.33301 22.9479V24.1562H25.6663V22.9479L23.2497 20.5312Z"
        fill={fill}
      />
    </svg>
  );
};
export default BellIcon;
