import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const StampIcon = ({
  fill = "#3F3F46",
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
        d="M4.66732 18.334H16.334M16.559 11.4423C16.3652 11.249 16.1351 11.0957 15.882 10.9914C15.6289 10.887 15.3578 10.8335 15.084 10.834H5.91732C5.36478 10.834 4.83488 11.0535 4.44418 11.4442C4.05348 11.8349 3.83398 12.3648 3.83398 12.9173V14.1673C3.83398 14.3883 3.92178 14.6003 4.07806 14.7566C4.23434 14.9129 4.4463 15.0007 4.66732 15.0007H16.334C16.555 15.0007 16.767 14.9129 16.9232 14.7566C17.0795 14.6003 17.1673 14.3883 17.1673 14.1673V12.9173C17.1673 12.3673 16.9507 11.834 16.559 11.4423Z"
        stroke={fill}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.1676 10.8337V7.08366C12.1676 5.83366 13.001 5.83366 13.001 4.16699C13.001 3.50395 12.7376 2.86807 12.2687 2.39923C11.7999 1.93038 11.164 1.66699 10.501 1.66699C9.11764 1.66699 8.00098 2.50033 8.00098 4.16699C8.00098 5.83366 8.83431 5.83366 8.83431 7.08366V10.8337"
        stroke={fill}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default StampIcon;
