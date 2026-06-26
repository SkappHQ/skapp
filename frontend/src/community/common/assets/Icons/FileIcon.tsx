import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const FileIcon = ({
  width = "24",
  height = "25",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M19.5015 10.8712V20.0002C19.5015 20.5969 19.2644 21.1692 18.8425 21.5912C18.4205 22.0131 17.8482 22.2502 17.2515 22.2502H6.75146C6.15473 22.2502 5.58243 22.0131 5.16047 21.5912C4.73852 21.1692 4.50146 20.5969 4.50146 20.0002V5.00002C4.50146 4.40328 4.73852 3.83098 5.16047 3.40902C5.58243 2.98706 6.15473 2.75 6.75146 2.75H11.3804C11.7781 2.75006 12.1594 2.90805 12.4407 3.18922L19.0622 9.81085C19.3434 10.0921 19.5014 10.4735 19.5015 10.8712Z"
        stroke="#71717A"
        strokeWidth="1.50001"
        strokeLinejoin="round"
      />
      <path
        d="M12.0005 3.125V8.75005C12.0005 9.14788 12.1585 9.52942 12.4398 9.81073C12.7211 10.092 13.1027 10.2501 13.5005 10.2501H19.1255"
        stroke="#71717A"
        strokeWidth="1.50001"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25146 14H15.7515"
        stroke="#71717A"
        strokeWidth="1.50001"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25146 17.75H15.7515"
        stroke="#71717A"
        strokeWidth="1.50001"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default FileIcon;
