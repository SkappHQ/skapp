import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CopyIcon = ({
  fill = "Black",
  width = "14",
  height = "15",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M10.1663 0.166504H2.16634C1.43301 0.166504 0.833008 0.766504 0.833008 1.49984V10.8332H2.16634V1.49984H10.1663V0.166504ZM12.1663 2.83317H4.83301C4.09967 2.83317 3.49967 3.43317 3.49967 4.1665V13.4998C3.49967 14.2332 4.09967 14.8332 4.83301 14.8332H12.1663C12.8997 14.8332 13.4997 14.2332 13.4997 13.4998V4.1665C13.4997 3.43317 12.8997 2.83317 12.1663 2.83317ZM12.1663 13.4998H4.83301V4.1665H12.1663V13.4998Z"
        fill={fill}
      />
    </svg>
  );
};

export default CopyIcon;
