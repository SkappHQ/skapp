import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const EmailIcon = ({
  fill = "black",
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
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M18.8337 4.99967C18.8337 4.08301 18.0837 3.33301 17.167 3.33301H3.83366C2.91699 3.33301 2.16699 4.08301 2.16699 4.99967V14.9997C2.16699 15.9163 2.91699 16.6663 3.83366 16.6663H17.167C18.0837 16.6663 18.8337 15.9163 18.8337 14.9997V4.99967ZM17.167 4.99967L10.5003 9.16634L3.83366 4.99967H17.167ZM17.167 14.9997H3.83366V6.66634L10.5003 10.833L17.167 6.66634V14.9997Z"
        fill={fill}
      />
    </svg>
  );
};

export default EmailIcon;
