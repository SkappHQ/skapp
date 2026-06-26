import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const MinusIcon = ({
  fill = "#B91C1C",
  width = "18",
  height = "17",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 18 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M8.99935 16.8332C4.39685 16.8332 0.666016 13.1023 0.666016 8.49984C0.666016 3.89734 4.39685 0.166504 8.99935 0.166504C13.6018 0.166504 17.3327 3.89734 17.3327 8.49984C17.3327 13.1023 13.6018 16.8332 8.99935 16.8332ZM8.99935 15.1665C10.7675 15.1665 12.4632 14.4641 13.7134 13.2139C14.9636 11.9636 15.666 10.2679 15.666 8.49984C15.666 6.73173 14.9636 5.03603 13.7134 3.78579C12.4632 2.53555 10.7675 1.83317 8.99935 1.83317C7.23124 1.83317 5.53555 2.53555 4.2853 3.78579C3.03506 5.03603 2.33268 6.73173 2.33268 8.49984C2.33268 10.2679 3.03506 11.9636 4.2853 13.2139C5.53555 14.4641 7.23124 15.1665 8.99935 15.1665ZM4.83268 7.6665H13.166V9.33317H4.83268V7.6665Z"
        fill={fill}
        style={{ fill, fillOpacity: 1 }}
      />
    </svg>
  );
};

export default MinusIcon;
