import {
  Avatar,
  Chip,
  ClipboardCheckIcon,
  DealValueIcon,
  HandshakeIcon
} from "@rootcodelabs/skapp-ui";
import { FC, FocusEvent, KeyboardEvent, MouseEvent } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import PriorityLabel from "~community/crm/components/atoms/PriorityLabel/PriorityLabel";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { CrmOwner } from "~community/crm/types/CommonTypes";

export interface DealCardProps {
  id: string;
  title: string;
  contactName: string;
  company?: string;
  owner: CrmOwner;
  amount?: string;
  priority: CrmPriorityEnum | null;
  taskCount?: number;
  isInteractive?: boolean;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

const DealCard: FC<DealCardProps> = ({
  id,
  title,
  contactName,
  company,
  owner,
  amount,
  priority,
  taskCount,
  isInteractive = true,
  className = "",
  onClick,
  ariaLabel
}) => {
  const imageUrl = useGetImageUrl(owner?.authPic ?? "");

  const handleTitleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (onClick && isInteractive) {
      onClick();
    }
  };

  const handleTitleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      if (onClick && isInteractive) {
        onClick();
      }
    }
  };

  const handleFocus = (e: FocusEvent<HTMLButtonElement>) => {
    if (isInteractive) {
      e.currentTarget.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
      });
    }
  };

  return (
    <div
      className={`w-full min-h-37.5 rounded-lg bg-white px-2 py-3 flex flex-col gap-3 text-left shadow-md ${isInteractive ? "cursor-grab active:cursor-grabbing hover:shadow-sm" : ""} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-status-pink text-white">
            <HandshakeIcon width={14} height={9} />
          </span>
          <span className="body3 text-secondary-text">#{id}</span>
        </div>

        {owner && (
          <Avatar
            id={String(owner.employeeId)}
            size="xs"
            src={imageUrl ?? ""}
            firstName={owner.firstName}
            lastName={owner.lastName ?? ""}
            className="w-6 h-6"
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        {isInteractive ? (
          <button
            type="button"
            className="body2 line-clamp-2 leading-4.5 tracking-[0.1px] cursor-pointer text-left hover:text-primary-text hover:underline"
            onClick={handleTitleClick}
            onKeyDown={handleTitleKeyDown}
            onFocus={handleFocus}
          >
            {title}
          </button>
        ) : (
          <p className="body2 line-clamp-2 leading-4.5 tracking-[0.1px]">
            {title}
          </p>
        )}

        {(contactName || company) && (
          <p className="body3 truncate text-secondary-icon">
            {contactName && <span>{contactName}</span>}
            {contactName && company && (
              <span className="mx-1 text-secondary-accent">•</span>
            )}
            {company && <span>{company}</span>}
          </p>
        )}

        <div className="flex items-center gap-1.5">
          <span className="shrink-0 text-secondary-icon">
            <DealValueIcon className="h-4 w-4" />
          </span>
          <span className="body3">{amount}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {taskCount !== undefined && taskCount > 0 && (
          <Chip
            size="sm"
            label={String(taskCount)}
            prefixIcon={
              <ClipboardCheckIcon
                fill="var(--color-label-text-slate)"
                width={9}
                height={10}
              />
            }
            className="bg-label-bg-slate text-label-text-slate w-12 h-6"
          />
        )}

        {priority && <PriorityLabel priority={priority} />}
      </div>
    </div>
  );
};

export default DealCard;
