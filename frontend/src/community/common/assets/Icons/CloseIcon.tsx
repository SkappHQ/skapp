import { Box } from "@mui/material";
import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CloseIcon = ({
  fill = "black",
  width = "21",
  height = "21",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <Box component="div" sx={{ display: "flex", alignItems: "center" }}>
      <svg
        id={id}
        width={width}
        height={height}
        viewBox="0 0 21 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
        {...svgProps}
        style={{ cursor: onClick ? "pointer" : "default" }}
      >
        <g clipPath="url(#clip0_3463_17966)">
          <path
            d="M15.8337 5.34199L14.6587 4.16699L10.0003 8.82533L5.34199 4.16699L4.16699 5.34199L8.82533 10.0003L4.16699 14.6587L5.34199 15.8337L10.0003 11.1753L14.6587 15.8337L15.8337 14.6587L11.1753 10.0003L15.8337 5.34199Z"
            fill={fill}
          />
        </g>
        <defs>
          <clipPath id="clip0_3463_17966">
            <rect width={width} height={height} fill="white" />
          </clipPath>
        </defs>
      </svg>
    </Box>
  );
};

export default CloseIcon;
