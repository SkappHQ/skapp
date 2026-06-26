import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const CreateDocumentIcon = ({
  fill = "#2A61A0",
  width = "24",
  height = "25",
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
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M11 4.5H4C3.46957 4.5 2.96086 4.71071 2.58579 5.08579C2.21071 5.46086 2 5.96957 2 6.5V20.5C2 21.0304 2.21071 21.5391 2.58579 21.9142C2.96086 22.2893 3.46957 22.5 4 22.5H18C18.5304 22.5 19.0391 22.2893 19.4142 21.9142C19.7893 21.5391 20 21.0304 20 20.5V13.5"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 3.00023C18.8978 2.6024 19.4374 2.37891 20 2.37891C20.5626 2.37891 21.1022 2.6024 21.5 3.00023C21.8978 3.39805 22.1213 3.93762 22.1213 4.50023C22.1213 5.06284 21.8978 5.6024 21.5 6.00023L12 15.5002L8 16.5002L9 12.5002L18.5 3.00023Z"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CreateDocumentIcon;
