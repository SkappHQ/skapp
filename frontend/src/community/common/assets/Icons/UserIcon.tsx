import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const UserIcon = ({
  fill = "black",
  width = "21",
  height = "20",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M3.83398 15.0003C3.83398 14.1163 4.18517 13.2684 4.81029 12.6433C5.43542 12.0182 6.28326 11.667 7.16732 11.667H13.834C14.718 11.667 15.5659 12.0182 16.191 12.6433C16.8161 13.2684 17.1673 14.1163 17.1673 15.0003C17.1673 15.4424 16.9917 15.8663 16.6792 16.1788C16.3666 16.4914 15.9427 16.667 15.5007 16.667H5.50065C5.05862 16.667 4.6347 16.4914 4.32214 16.1788C4.00958 15.8663 3.83398 15.4424 3.83398 15.0003Z"
        stroke={fill}
        strokeWidth="1.66667"
        strokeLinejoin="round"
      />
      <path
        d="M10.501 8.33398C11.8817 8.33398 13.001 7.2147 13.001 5.83398C13.001 4.45327 11.8817 3.33398 10.501 3.33398C9.12026 3.33398 8.00098 4.45327 8.00098 5.83398C8.00098 7.2147 9.12026 8.33398 10.501 8.33398Z"
        stroke={fill}
        strokeWidth="1.66667"
      />
    </svg>
  );
};

export default UserIcon;
