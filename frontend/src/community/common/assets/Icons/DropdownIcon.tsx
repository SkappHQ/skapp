import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const DropdownIcon = ({
  fill = "#3F3F46",
  width = "20",
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
      viewBox="0 0 19 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M13.3333 2.5H15.8333L14.5833 4.16667L13.3333 2.5ZM1.66667 0H16.6667C17.1087 0 17.5326 0.175595 17.8452 0.488155C18.1577 0.800716 18.3333 1.22464 18.3333 1.66667V5C18.3333 5.925 17.5917 6.66667 16.6667 6.66667H12.5V15C12.5 15.925 11.7583 16.6667 10.8333 16.6667H1.66667C1.22464 16.6667 0.800716 16.4911 0.488155 16.1785C0.175595 15.8659 0 15.442 0 15V1.66667C0 0.75 0.75 0 1.66667 0ZM1.66667 1.66667V5H10.8333V1.66667H1.66667ZM16.6667 5V1.66667H12.5V5H16.6667ZM1.66667 15H10.8333V6.66667H1.66667V15ZM3.33333 8.33333H9.16667V10H3.33333V8.33333ZM3.33333 11.6667H9.16667V13.3333H3.33333V11.6667Z"
        fill={fill}
      />
    </svg>
  );
};

export default DropdownIcon;
