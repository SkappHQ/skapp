import { useTheme } from "@mui/material";
import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const DeniedIcon = ({
  fill,
  width = "32",
  height = "33",
  id,
  svgProps
}: IconProps): JSX.Element => {
  const theme = useTheme();

  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 32 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <path
        d="M25.1952 7.0182C30.4315 12.2547 30.4315 20.7448 25.1952 25.9813C19.9587 31.2177 11.4686 31.2177 6.23206 25.9813C0.995564 20.7448 0.995564 12.2547 6.23206 7.0182C11.4686 1.78169 19.9587 1.78169 25.1952 7.0182ZM25.1952 7.0182L6.23352 25.9798"
        stroke={fill ?? theme.palette.notifyBadge.main}
        style={{
          stroke: fill ?? theme.palette.notifyBadge.main,
          strokeOpacity: 1
        }}
        strokeWidth="4"
      />
    </svg>
  );
};

export default DeniedIcon;
