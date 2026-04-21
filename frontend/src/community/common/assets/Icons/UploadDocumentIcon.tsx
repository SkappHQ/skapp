import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const UploadDocumentIcon = ({
  fill = "black",
  width = "47",
  height = "53",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 47 53"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path
        d="M29.3281 1.50781V11.0971C29.3281 12.3958 29.8455 13.6438 30.7681 14.5638C31.6931 15.4848 32.9455 16.0016 34.2508 16.0011H45.2508"
        stroke={fill}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45.5 17.0173V39.8653C45.4471 41.3598 45.0989 42.829 44.4755 44.1883C43.8522 45.5476 42.966 46.7701 41.868 47.7854C40.7691 48.8053 39.4801 49.5987 38.0744 50.1203C36.6688 50.642 35.1742 50.8815 33.676 50.8253H13.436C11.9286 50.8942 10.4225 50.6649 9.00394 50.1506C7.58537 49.6362 6.28227 48.847 5.16933 47.828C4.06072 46.81 3.16545 45.5819 2.53554 44.2149C1.90563 42.848 1.55363 41.3695 1.5 39.8653V12.468C1.55294 10.9735 1.90113 9.50433 2.52448 8.14503C3.14783 6.78574 4.03403 5.56325 5.132 4.54801C6.23088 3.52807 7.51995 2.73463 8.92556 2.21302C10.3312 1.6914 11.8258 1.45184 13.324 1.50801H28.5613C30.8874 1.4998 33.1327 2.36045 34.8573 3.92135L42.7507 11.18C43.5929 11.9056 44.2731 12.8003 44.7467 13.806C45.2204 14.8117 45.4771 15.9059 45.5 17.0173Z"
        stroke={fill}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.5 22.1641V40.2281"
        stroke={fill}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M31.7841 29.7698L24.6774 22.6631C24.5236 22.5075 24.3405 22.3839 24.1387 22.2996C23.9368 22.2153 23.7202 22.1719 23.5014 22.1719C23.2826 22.1719 23.0661 22.2153 22.8642 22.2996C22.6623 22.3839 22.4792 22.5075 22.3254 22.6631L15.2188 29.7724"
        stroke={fill}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UploadDocumentIcon;
