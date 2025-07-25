import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const IntegrationsIcon = ({
  fill = "black",
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
      {...svgProps}
    >
      <g clipPath="url(#clip0_8185_54082)">
        <path
          d="M22.78 11.4597L19.46 8.13966C20.8 7.83966 21.8 6.63966 21.8 5.19966C21.8 3.53966 20.44 2.17966 18.78 2.17966C17.34 2.17966 16.16 3.17966 15.84 4.51966L12.54 1.21966C12.471 1.14891 12.3886 1.09267 12.2976 1.05427C12.2066 1.01588 12.1088 0.996094 12.01 0.996094C11.9112 0.996094 11.8134 1.01588 11.7224 1.05427C11.6314 1.09267 11.5489 1.14891 11.48 1.21966L8.14 4.53966C9.48 4.83966 10.48 6.03966 10.48 7.47966C10.48 9.13966 9.12 10.4997 7.46 10.4997C6.02 10.4997 4.83999 9.49966 4.51999 8.15966L1.22 11.4597C0.919995 11.7597 0.919995 12.2397 1.22 12.5197L4.53999 15.8397C3.19999 16.1597 2.2 17.3597 2.2 18.7797C2.2 20.4397 3.56 21.7997 5.22 21.7997C6.66 21.7997 7.84 20.7997 8.16 19.4597L11.48 22.7797C11.78 23.0797 12.26 23.0797 12.54 22.7797L15.86 19.4597C14.52 19.1597 13.5 17.9597 13.5 16.5197C13.5 14.8597 14.86 13.4997 16.52 13.4997C17.96 13.4997 19.14 14.4997 19.46 15.8397L22.78 12.5197C23.08 12.2397 23.08 11.7597 22.78 11.4597Z"
          stroke={fill}
          style={{ stroke: fill, strokeOpacity: 1 }}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_8185_54082">
          <rect
            width="24"
            height="24"
            fill="white"
            style={{ fill: "white", fillOpacity: 1 }}
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default IntegrationsIcon;
