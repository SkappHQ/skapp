import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const AttendanceModuleIcon = ({
  width = "28",
  height = "34",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 28 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M24.9903 10.6967L27.1597 8.52724C26.5028 7.74805 25.7847 7.01471 25.0055 6.37303L22.836 8.54251C20.4679 6.64803 17.4887 5.51746 14.2498 5.51746C6.65657 5.51746 0.499512 11.6745 0.499512 19.2677C0.499512 26.8609 6.64129 33.018 14.2498 33.018C21.8582 33.018 28 26.8609 28 19.2677C28 16.044 26.8695 13.0648 24.9903 10.6967ZM14.2498 29.9776C8.33716 29.9776 3.55513 25.1956 3.55513 19.283C3.55513 13.3704 8.33716 8.58835 14.2498 8.58835C20.1624 8.58835 24.9444 13.3704 24.9444 19.283C24.9444 25.1956 20.1624 29.9776 14.2498 29.9776Z"
        fill="#2A61A0"
        style={{ fill: "#2A61A0", fillOpacity: 1 }}
      />
      <rect
        x="12.5669"
        y="11.5796"
        width="3.1511"
        height="9.16684"
        fill="#EF8D42"
        style={{ fill: "#EF8D42", fillOpacity: 1 }}
      />
      <rect
        x="9.70312"
        y="0.980957"
        width="9.16684"
        height="3.1511"
        fill="#D64550"
        style={{ fill: "#D64550", fillOpacity: 1 }}
      />
    </svg>
  );
};

export default AttendanceModuleIcon;
