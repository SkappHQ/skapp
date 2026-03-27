import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const IdentityVerifiedIcon = ({
  fill = "#2A61A0",
  width = "24",
  height = "24",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      z={1}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...svgProps}
    >
      <path
        d="M2.5 8.187C2.604 6.087 2.915 4.777 3.847 3.847C4.777 2.915 6.087 2.604 8.187 2.5M21.5 8.187C21.396 6.087 21.085 4.777 20.153 3.847C19.223 2.915 17.913 2.604 15.813 2.5M15.813 21.5C17.913 21.396 19.223 21.085 20.153 20.153C21.085 19.223 21.396 17.913 21.5 15.813M8.187 21.5C6.087 21.396 4.777 21.085 3.847 20.153C2.915 19.223 2.604 17.913 2.5 15.813M17.5 17L17.298 16.151C17.2159 15.8065 17.0437 15.49 16.7991 15.2338C16.5545 14.9776 16.2463 14.791 15.906 14.693L13.5 13.999V12.532C14.396 11.927 15 10.796 15 9.5C15 7.567 13.656 6 12 6C10.343 6 9 7.567 9 9.5C9 10.796 9.603 11.927 10.5 12.532V13.999L8.109 14.699C7.77885 14.7957 7.47922 14.9758 7.23905 15.2221C6.99889 15.4684 6.82631 15.7725 6.738 16.105L6.5 17"
        stroke={fill}
      />
    </svg>
  );
};

export default IdentityVerifiedIcon;
