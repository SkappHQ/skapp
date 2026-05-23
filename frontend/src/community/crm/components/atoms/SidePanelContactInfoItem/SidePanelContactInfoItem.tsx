import { FC, KeyboardEvent, ReactNode } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

interface Props {
    icon: IconName | ReactNode;
    value: string | null;
    endIcon?: IconName;
    onClick?: () => void;
}

const ContactInfoItem: FC<Props> = ({
    icon,
    value,
    endIcon,
    onClick
}) => {
    const cls = styles;

    const isInteractive = !!onClick;

    const inner = (
        <>
            <span className={cls.iconWrapper} style={{ color: cls.iconFill }}>
                {typeof icon === "string" ? (
                    <Icon name={icon as IconName} fill={cls.iconFill} width="20" height="20" />
                ) : (
                    icon
                )}
            </span>
            {isInteractive ? (
                <span className={cls.link}>
                    <span className={cls.linkText}>{value}</span>
                    {endIcon && (
                        <Icon
                            name={endIcon}
                            fill={cls.endIconFill}
                            width="16"
                            height="16"
                        />
                    )}
                </span>
            ) : (
                <span className={value ? cls.plainText : cls.emptyText}>
                    {value ?? "—"}
                </span>
            )}
        </>
    );

    if (isInteractive) {
        const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
            }
        };

        return (
            <div
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={handleKeyDown}
                className={cls.linkRow}
            >
                {inner}
            </div>
        );
    }

    return <div className={cls.row}>{inner}</div>;
};



export default ContactInfoItem;