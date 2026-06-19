import {
  Avatar,
  Chip,
  ClipboardCheckIcon,
  DealValueIcon,
  HandshakeIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";
import PriorityLabel from "~community/crm/components/atoms/PriorityLabel/PriorityLabel";
import useGetImageUrl from "~community/common/hooks/useGetImageUrl";

export type DealPriority = CrmPriorityEnum;

export interface DealCardOwner {
  id: string;
  firstName?: string;
  lastName?: string;
  src?: string;
}

export interface DealCardProps {
  id: string;
  title: string;
  contactName?: string;
  company: string;
  owner?: DealCardOwner;
  formattedValue: string;
  priority: DealPriority;
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
  formattedValue,
  priority,
  taskCount,
  isInteractive = true,
  className = "",
  onClick,
  ariaLabel
}) => {
  const imageUrl = useGetImageUrl(owner?.src ?? "");

  const wrapperClasses = [
    "w-full min-h-[150px] rounded-[8px] bg-white px-2 py-3",
    "flex flex-col gap-3",
    "outline outline-1 outline-zinc-200",
    "text-left transition-shadow",
    isInteractive && "cursor-pointer hover:shadow-md hover:outline-zinc-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
            <HandshakeIcon />
          </span>
          <span className="body3 font-semibold text-zinc-500">
            {id.startsWith("#") ? id : `#${id.replace(/^deal-/, "")}`}
          </span>
        </div>

        {owner && (
          <Avatar
            id={owner.id}
            size="sm"
            src={imageUrl ?? ""}
            firstName={owner.firstName}
            lastName={owner.lastName ?? ""}
          />
        )}
      </div>

      <p
        className="line-clamp-2 text-zinc-950"
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "18px",
          letterSpacing: "0.1px"
        }}
      >
        {title}
      </p>

      {(contactName || company) && (
        <p
          className="truncate text-zinc-500"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "16px",
            letterSpacing: "0.1px"
          }}
        >
          {contactName && <span>{contactName}</span>}
          {contactName && company && (
            <span className="mx-1 text-zinc-300">•</span>
          )}
          {company && <span>{company}</span>}
        </p>
      )}

      <div className="flex items-center gap-1.5">
        <span className="shrink-0 text-zinc-500">
          <DealValueIcon className="h-4 w-4" />
        </span>
        <span
          className="text-zinc-950"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "18px",
            letterSpacing: "0.1px"
          }}
        >
          {formattedValue}
        </span>
      </div>

      <div className="flex items-center justify-end gap-2">
        {taskCount !== undefined && taskCount > 0 && (
          <Chip
            size="sm"
            label={String(taskCount)}
            prefixIcon={
              <span className="[&_svg]:h-3 [&_svg]:w-3">
                <ClipboardCheckIcon fill="text-slate-600" />
              </span>
            }
            className="bg-slate-200 text-slate-600"
          />
        )}

        <PriorityLabel priority={priority} />
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={wrapperClasses}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={wrapperClasses} aria-label={ariaLabel}>
      {inner}
    </div>
  );
};

export default DealCard;
