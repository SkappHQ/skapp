import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const UserUploadIcon = ({
  fill = "#71717A",
  width = "48",
  height = "48",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 45 45"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M37.5 39.375V35.625C37.5 33.6359 36.7098 31.7282 35.3033 30.3217C33.8968 28.9152 31.9891 28.125 30 28.125H15C13.0109 28.125 11.1032 28.9152 9.6967 30.3217C8.29018 31.7282 7.5 33.6359 7.5 35.625V39.375"
        stroke={fill}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.5 20.625C26.6421 20.625 30 17.2671 30 13.125C30 8.98286 26.6421 5.625 22.5 5.625C18.3579 5.625 15 8.98286 15 13.125C15 17.2671 18.3579 20.625 22.5 20.625Z"
        stroke={fill}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UserUploadIcon;
