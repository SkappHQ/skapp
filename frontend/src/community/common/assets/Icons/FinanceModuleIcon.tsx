import { IconProps } from "~community/common/types/IconTypes";

const FinanceModuleIcon = ({
  width = "48",
  height = "40",
  id,
  svgProps,
  onClick
}: IconProps) => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 35 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <rect
        x="0.872658"
        y="1.32798"
        width="30.3004"
        height="20.5263"
        rx="1.991"
        stroke="#2A61A0"
        style={{ stroke: "#2A61A0", strokeOpacity: 1 }}
        strokeWidth="1.53154"
      />
      <rect
        x="5.24097"
        y="4.95703"
        width="28.7689"
        height="18.9948"
        rx="1.22523"
        fill="white"
        stroke="#2A61A0"
        style={{
          fill: "white",
          fillOpacity: 1,
          stroke: "#2A61A0",
          strokeOpacity: 1
        }}
        strokeWidth="1.83785"
      />
      <path
        d="M8.84351 11.6135C11.7848 11.5016 12.4434 10.6585 12.4559 8.23047H26.5614C26.7955 10.7425 27.3192 11.8446 30.4031 12.1295V17.5194C27.8418 17.4633 26.9798 18.1433 26.5614 20.6731H12.4559C12.422 18.2109 11.6692 17.4 8.84351 17.118V11.6135Z"
        fill="#EF8D42"
        stroke="#D64550"
        style={{
          fill: "#EF8D42",
          fillOpacity: 1,
          stroke: "#D64550",
          strokeOpacity: 1
        }}
        strokeWidth="1.53154"
        strokeLinejoin="round"
      />
      <circle
        cx="19.6277"
        cy="14.4487"
        r="1.69675"
        fill="white"
        style={{ fill: "white", fillOpacity: 1 }}
      />
    </svg>
  );
};

export default FinanceModuleIcon;
