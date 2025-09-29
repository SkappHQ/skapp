import { JSX } from "react";
import { IconProps } from "~community/common/types/IconTypes";

const EnglishFlagIcon = ({
    fill = "black",
    width = "21",
    height = "17",
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
            viewBox="0 0 21 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={onClick}
            {...svgProps}
        >
            <g clipPath="url(#clip0_8792_29794)">
                <path d="M0 0.75H20.6667V16.25H0V0.75Z" fill="#012169" style={{ fill: "#012169", fillOpacity: 1 }} />
                <path d="M2.42188 0.75L10.301 6.59479L18.1479 0.75H20.6667V2.75208L12.9167 8.53229L20.6667 14.2802V16.25H18.0833L10.3333 10.4698L2.61563 16.25H0V14.3125L7.71771 8.56458L0 2.81667V0.75H2.42188Z" fill="white" style={{ fill: "white", fillOpacity: 1 }} />
                <path d="M13.6917 9.82396L20.6667 14.9583V16.25L11.9156 9.82396H13.6917ZM7.75 10.4698L7.94375 11.6L1.74375 16.25H0L7.75 10.4698ZM20.6667 0.75V0.846875L12.626 6.91771L12.6906 5.49688L19.0521 0.75H20.6667ZM0 0.75L7.71771 6.43333H5.78021L0 2.10625V0.75Z" fill="#C8102E" style={{ fill: "#C8102E", fillOpacity: 1 }} />
                <path d="M7.78229 0.75V16.25H12.949V0.75H7.78229ZM0 5.91667V11.0833H20.6667V5.91667H0Z" fill="white" style={{ fill: "white", fillOpacity: 1 }} />
                <path d="M0 6.98229V10.0823H20.6667V6.98229H0ZM8.81563 0.75V16.25H11.9156V0.75H8.81563Z" fill="#C8102E" style={{ fill: "#C8102E", fillOpacity: 1 }} />
            </g>
            <defs>
                <clipPath id="clip0_8792_29794">
                    <rect y="0.75" width="20.6667" height="15.5" rx="2" fill="white" style={{ fill: "white", fillOpacity: 1 }} />
                </clipPath>
            </defs>
        </svg>
    );
};

export default EnglishFlagIcon;