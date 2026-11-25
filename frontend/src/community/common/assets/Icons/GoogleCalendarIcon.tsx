import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const GoogleCalendarIcon = ({
  width = "32",
  height = "32",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 36 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <image href="/image/google-calendar.png" width="36" height="38.6625" />
    </svg>
  );
};

export default GoogleCalendarIcon;
