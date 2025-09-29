import { JSX } from "react";
import { IconProps } from "~community/common/types/IconTypes";

const SwedishFlagIcon = ({
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
            <g clipPath="url(#clip0_8792_29800)">
                <path d="M0 0.75H20.6667V16.25H0V0.75Z" fill="#005293" style={{ fill: "#005293", fillOpacity: 1 }} />
                <path d="M5.68333 0.75V6.95H0V10.05H5.68333V16.25H8.78333V10.05H20.6667V6.95H8.78333V0.75H5.68333Z" fill="#FECB00" style={{ fill: "#FECB00", fillOpacity: 1 }} />
            </g>
            <defs>
                <clipPath id="clip0_8792_29800">
                    <rect y="0.75" width="20.6667" height="15.5" rx="2" fill="white" style={{ fill: "white", fillOpacity: 1 }} />
                </clipPath>
            </defs>
        </svg>
    );
};

export default SwedishFlagIcon;