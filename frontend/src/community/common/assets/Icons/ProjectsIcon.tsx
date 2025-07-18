import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const ProjectsIcon = ({
  fill = "black",
  width = "24",
  height = "25",
  id
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 21.5507V3.55066M3 10.5507H21M5.4 3.55066H18.6C19.2365 3.55066 19.847 3.80352 20.2971 4.2536C20.7471 4.70369 21 5.31414 21 5.95066V19.1507C21 19.7872 20.7471 20.3976 20.2971 20.8477C19.847 21.2978 19.2365 21.5507 18.6 21.5507H5.4C4.76348 21.5507 4.15303 21.2978 3.70294 20.8477C3.25286 20.3976 3 19.7872 3 19.1507V5.95066C3 5.63549 3.06208 5.3234 3.18269 5.03222C3.3033 4.74104 3.48008 4.47646 3.70294 4.2536C4.15303 3.80352 4.76348 3.55066 5.4 3.55066Z"
        stroke={fill}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ProjectsIcon;
