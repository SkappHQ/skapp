import { JSX } from "react";
import { IconProps } from "~community/common/types/IconTypes";

const LeaveModuleIcon = ({
  width = "151",
  height = "147",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 151 147"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M63.7803 129.709L100.168 33.3223"
        stroke="#D64550"
        style={{
          stroke: "color(display-p3 0.8392 0.2706 0.3137)",
          strokeOpacity: 1,
        }}
        strokeWidth="4.10244"
      />
      <path
        d="M126.425 90.1781L84.5957 74.5626L100.505 32.4213C128.827 42.9943 134.043 61.8853 126.425 90.1781Z"
        fill="#2A61A0"
        style={{
          fill: "color(display-p3 0.1653 0.3810 0.6285)",
          fillOpacity: 1,
        }}
      />
      <path
        d="M84.5957 74.5626L100.505 32.4213C112.8 40.4336 113.276 66.8558 107.183 82.995L84.5957 74.5626Z"
        fill="#EF8D42"
        style={{
          fill: "color(display-p3 0.9373 0.5529 0.2588)",
          fillOpacity: 1,
        }}
      />
      <path
        d="M42.7666 58.9471L84.5957 74.5626L100.505 32.4213C72.1831 21.8483 55.7536 32.6585 42.7666 58.9471Z"
        fill="#2A61A0"
        style={{
          fill: "color(display-p3 0.1653 0.3810 0.6285)",
          fillOpacity: 1,
        }}
      />
      <path
        d="M84.5957 74.5626L100.505 32.4213C85.9448 30.4081 68.1009 49.991 62.008 66.1303L84.5957 74.5626Z"
        fill="#D64550"
        style={{
          fill: "color(display-p3 0.8392 0.2706 0.3137)",
          fillOpacity: 1,
        }}
      />
      <path
        d="M139.886 142.581H0C23.2025 126.226 41.3988 115.802 70.8437 116.055C99.6286 116.303 133.831 126.274 139.886 142.581Z"
        fill="#EF8D42"
        style={{
          fill: "color(display-p3 0.9373 0.5529 0.2588)",
          fillOpacity: 1,
        }}
      />
    </svg>
  );
};

export default LeaveModuleIcon;