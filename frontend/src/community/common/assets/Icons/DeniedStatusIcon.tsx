import { JSX } from "react";

const DeniedStatusIcon = (): JSX.Element => {
  return (
    <svg
      width="9"
      height="8"
      viewBox="0 0 9 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="denied"
    >
      <circle cx="4.5" cy="4" r="4" fill="#DC2626" />
    </svg>
  );
};

export default DeniedStatusIcon;
