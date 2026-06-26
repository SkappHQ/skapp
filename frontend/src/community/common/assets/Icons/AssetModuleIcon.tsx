import { IconProps } from "~community/common/types/IconTypes";

const AssetModuleIcon = ({
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
      viewBox="0 0 31 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M12.0863 17.8079L0.298584 13.2559V18.4335L12.0863 23.8388V17.8079Z"
        fill="#2A61A0"
        style={{ fill: "#2A61A0", fillOpacity: 1 }}
      />
      <path
        d="M12.0863 11.0972L0.298584 6.74217V12.3665L12.0863 17.1281V11.0972Z"
        fill="#2A61A0"
        style={{ fill: "#2A61A0", fillOpacity: 1 }}
      />
      <path
        d="M12.0863 4.37657L0.298584 0.675781V6.02136L12.0863 10.4075V4.37657Z"
        fill="#2A61A0"
        style={{ fill: "#2A61A0", fillOpacity: 1 }}
      />
      <path
        d="M30.4499 23.8454H12.083V17.8145L30.4499 17.8515V23.8454Z"
        fill="#D64550"
        style={{ fill: "#D64550", fillOpacity: 1 }}
      />
      <path
        d="M30.4499 17.1227H12.083V11.0918L30.4499 11.1288V17.1227Z"
        fill="#D64550"
        style={{ fill: "#D64550", fillOpacity: 1 }}
      />
      <path
        d="M30.4499 10.4079H12.083V4.37695L30.4499 4.41399V10.4079Z"
        fill="#D64550"
        style={{ fill: "#D64550", fillOpacity: 1 }}
      />
      <path
        d="M16.6884 0.675798L0.298584 0.675781L12.0882 4.37573L30.4514 4.41659L16.6884 0.675798Z"
        fill="#EF8D42"
        style={{ fill: "#EF8D42", fillOpacity: 1 }}
      />
    </svg>
  );
};

export default AssetModuleIcon;
