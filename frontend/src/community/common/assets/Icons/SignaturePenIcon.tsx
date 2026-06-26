import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const SignaturePenIcon = ({
  fill = "#2A61A0",
  width = "25",
  height = "24",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M12.666 20H21.666"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          stroke: fill,
          strokeOpacity: 1
        }}
      />
      <path
        d="M17.166 3.50023C17.5638 3.1024 18.1034 2.87891 18.666 2.87891C18.9446 2.87891 19.2204 2.93378 19.4778 3.04038C19.7352 3.14699 19.969 3.30324 20.166 3.50023C20.363 3.69721 20.5193 3.93106 20.6259 4.18843C20.7325 4.4458 20.7873 4.72165 20.7873 5.00023C20.7873 5.2788 20.7325 5.55465 20.6259 5.81202C20.5193 6.06939 20.363 6.30324 20.166 6.50023L7.66602 19.0002L3.66602 20.0002L4.66602 16.0002L17.166 3.50023Z"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          stroke: fill,
          strokeOpacity: 1
        }}
      />
    </svg>
  );
};

export default SignaturePenIcon;
