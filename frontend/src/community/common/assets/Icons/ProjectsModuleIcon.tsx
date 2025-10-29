import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const ProjectsModuleIcon = ({
  width = "46",
  height = "41",
  id,
  svgProps,
  onClick
}: IconProps): JSX.Element => {
  return (
    <svg
      id={id}
      width={width}
      height={height}
      viewBox="0 0 34 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...svgProps}
    >
      <path 
        d="M16.6355 4.56152H19.2407C19.9317 4.56152 20.1751 4.57091 21.0829 5.36227C21.9907 6.15363 21.5565 8.61415 21.5565 8.61415M21.5565 26.4329C21.5565 27.1579 21.5715 27.8533 21.0829 28.366C20.5944 28.8787 19.9317 29.1668 19.2407 29.1668H3.60917C2.91821 29.1668 2.25555 28.8787 1.76697 28.366C1.27839 27.8533 1.00391 27.1579 1.00391 26.4329V7.29544C1.00391 6.57036 1.27839 5.87498 1.76697 5.36227C2.25555 4.84956 2.91821 4.56152 3.60917 4.56152H6.21443" 
        stroke="#2A61A0" 
        strokeWidth="2.02632" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M15.3159 1.95703H7.58699C6.87556 1.95703 6.29883 2.53376 6.29883 3.24519V5.82151C6.29883 6.53294 6.87556 7.10966 7.58699 7.10966H15.3159C16.0274 7.10966 16.6041 6.53294 16.6041 5.82151V3.24519C16.6041 2.53376 16.0274 1.95703 15.3159 1.95703Z" 
        stroke="#2A61A0" 
        strokeWidth="2.02632" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <mask id="path-3-inside-1_5683_99644" fill="white">
        <rect x="4.47852" y="11.5059" width="5.35526" height="5.35526" rx="0.892544"/>
      </mask>
      <rect 
        x="4.47852" 
        y="11.5059" 
        width="5.35526" 
        height="5.35526" 
        rx="0.892544" 
        stroke="#EF8D42" 
        strokeWidth="2.23136" 
        mask="url(#path-3-inside-1_5683_99644)"
      />
      <mask id="path-4-inside-2_5683_99644" fill="white">
        <rect x="4.47852" y="19.1782" width="5.64473" height="5.64474" rx="0.940789"/>
      </mask>
      <rect 
        x="4.47852" 
        y="19.1782" 
        width="5.64473" 
        height="5.64474" 
        rx="0.940789" 
        stroke="#EF8D42" 
        strokeWidth="2.35197" 
        mask="url(#path-4-inside-2_5683_99644)"
      />
      <path 
        d="M12.3516 12.9854H19.7322" 
        stroke="#EF8D42" 
        strokeWidth="1.47613" 
        strokeLinecap="round"
      />
      <path 
        d="M12.2578 20.1543H20.0374" 
        stroke="#EF8D42" 
        strokeWidth="1.55592" 
        strokeLinecap="round"
      />
      <path 
        d="M12.3516 15.4463H16.5339" 
        stroke="#EF8D42" 
        strokeWidth="1.47613" 
        strokeLinecap="round"
      />
      <path 
        d="M12.2578 22.7505H16.6663" 
        stroke="#EF8D42" 
        strokeWidth="1.55592" 
        strokeLinecap="round"
      />
      <circle 
        cx="23.8262" 
        cy="17.5147" 
        r="7.78867" 
        fill="#D64550" 
        stroke="white" 
        strokeWidth="2.30775"
      />
      <path 
        d="M27.0598 15.707L23.0387 19.7281L21.2109 17.9004" 
        stroke="white" 
        strokeWidth="1.46221" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ProjectsModuleIcon;
