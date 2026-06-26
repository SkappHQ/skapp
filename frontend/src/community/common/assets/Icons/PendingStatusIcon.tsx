import { JSX } from "react";

const PendingStatusIcon = (): JSX.Element => {
  return (
    <svg
      width="9"
      height="8"
      viewBox="0 0 9 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="pending"
    >
      <circle cx="4.5" cy="4" r="3" stroke="#65A30D" strokeWidth="2" />
    </svg>
  );
};

export default PendingStatusIcon;
