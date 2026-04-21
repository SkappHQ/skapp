import { IconProps } from "~community/common/types/IconTypes";

const ProjectManagementModuleIcon = ({
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
      viewBox="0 0 22 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <rect
        width="6.71309"
        height="16.7827"
        rx="0.527203"
        fill="#2A61A0"
        style={{ fill: "#2A61A0" }}
      />
      <rect
        x="1.00488"
        y="1.00781"
        width="4.69916"
        height="2.68523"
        rx="0.310791"
        fill="white"
        style={{ fill: "white" }}
      />
      <rect
        x="1.00488"
        y="4.36328"
        width="4.69916"
        height="2.68523"
        rx="0.310791"
        fill="white"
        style={{ fill: "white" }}
      />
      <rect
        x="7.33496"
        width="6.71309"
        height="12.4192"
        rx="0.527203"
        fill="#D64550"
        style={{ fill: "#D64550" }}
      />
      <rect
        x="8.3877"
        y="1.00781"
        width="4.69916"
        height="2.68523"
        rx="0.310791"
        fill="white"
        style={{ fill: "white" }}
      />
      <rect
        x="14.6689"
        width="6.71309"
        height="15.1044"
        rx="0.527203"
        fill="#EF8D42"
        style={{ fill: "#EF8D42" }}
      />
      <rect
        x="15.6104"
        y="1.00781"
        width="4.69916"
        height="2.68523"
        rx="0.310791"
        fill="white"
        style={{ fill: "white" }}
      />
    </svg>
  );
};

export default ProjectManagementModuleIcon;
