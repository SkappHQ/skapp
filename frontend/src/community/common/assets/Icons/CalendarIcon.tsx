import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CalendarIcon = ({
  fill = "black",
  width = "14",
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
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M12.333 2.00033H11.6663V0.666992H10.333V2.00033H3.66634V0.666992H2.33301V2.00033H1.66634C0.933008 2.00033 0.333008 2.60033 0.333008 3.33366V14.0003C0.333008 14.7337 0.933008 15.3337 1.66634 15.3337H12.333C13.0663 15.3337 13.6663 14.7337 13.6663 14.0003V3.33366C13.6663 2.60033 13.0663 2.00033 12.333 2.00033ZM12.333 14.0003H1.66634V6.66699H12.333V14.0003ZM12.333 5.33366H1.66634V3.33366H12.333V5.33366Z"
        fill={fill}
      />
    </svg>
  );
};

export default CalendarIcon;
