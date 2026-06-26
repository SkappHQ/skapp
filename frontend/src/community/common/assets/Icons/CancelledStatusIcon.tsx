import { JSX } from "react";

const CancelledStatusIcon = (): JSX.Element => {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="cancelled"
    >
      <circle cx="4" cy="4" r="4" fill="black" />
    </svg>
  );
};

export default CancelledStatusIcon;
