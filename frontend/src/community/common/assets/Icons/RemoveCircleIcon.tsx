import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const RemoveCircleIcon = ({
  fill = "#B91C1C",
  width = "14",
  height = "15",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M3.66659 6.83331V8.16665H10.3333V6.83331H3.66659ZM6.99992 0.833313C3.31992 0.833313 0.333252 3.81998 0.333252 7.49998C0.333252 11.18 3.31992 14.1666 6.99992 14.1666C10.6799 14.1666 13.6666 11.18 13.6666 7.49998C13.6666 3.81998 10.6799 0.833313 6.99992 0.833313ZM6.99992 12.8333C4.05992 12.8333 1.66659 10.44 1.66659 7.49998C1.66659 4.55998 4.05992 2.16665 6.99992 2.16665C9.93992 2.16665 12.3333 4.55998 12.3333 7.49998C12.3333 10.44 9.93992 12.8333 6.99992 12.8333Z"
        fill={fill}
      />
    </svg>
  );
};

export default RemoveCircleIcon;
