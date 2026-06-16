import {
  Avatar,
  CheckTaskIcon,
  HandshakeIcon,
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  SubTaskIcon
} from "@rootcodelabs/skapp-ui";
import React from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";

export type DealPriority = CrmPriorityEnum;

export interface DealCardAssignee {
  id: string;
  firstName?: string;
  lastName?: string;
  src?: string;
  alt?: string;
}

export interface DealCardProps {
  id: string;
  title: string;
  contactName?: string;
  company: string;
  assignee?: DealCardAssignee;
  formattedValue: string;
  priority: DealPriority;
  taskCount?: number;
  taskCountTooltip?: string;
  isInteractive?: boolean;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

const PRIORITY_BADGE: Record<
  CrmPriorityEnum,
  { icon: React.ReactNode; bg: string; iconColor: string; ariaLabel: string }
> = {
  [CrmPriorityEnum.HIGH]: {
    icon: <HighPriorityIcon />,
    bg: "bg-semantic-red-background",
    iconColor: "text-semantic-red-text",
    ariaLabel: "High priority"
  },
  [CrmPriorityEnum.MEDIUM]: {
    icon: <MediumPriorityIcon />,
    bg: "bg-semantic-amber-background",
    iconColor: "text-semantic-amber-text",
    ariaLabel: "Medium priority"
  },
  [CrmPriorityEnum.LOW]: {
    icon: <LowPriorityIcon />,
    bg: "bg-semantic-green-background",
    iconColor: "text-semantic-green-text",
    ariaLabel: "Low priority"
  }
};

const DealCard: React.FC<DealCardProps> = ({
  id,
  title,
  contactName,
  company,
  assignee,
  formattedValue,
  priority,
  taskCount,
  taskCountTooltip,
  isInteractive = true,
  className = "",
  onClick,
  ariaLabel
}) => {
  const badge = PRIORITY_BADGE[priority];

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

        {assignee && (
          <Avatar
            id={assignee.id}
            size="sm"
            src={assignee.src}
            firstName={assignee.firstName}
            lastName={assignee.lastName}
            alt={
              assignee.alt ??
              `${assignee.firstName ?? ""} ${assignee.lastName ?? ""}`.trim()
            }
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
          <CheckTaskIcon className="h-4 w-4" />
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
          <span
            title={taskCountTooltip ?? `${taskCount} tasks`}
            className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-zinc-600"
          >
            <SubTaskIcon stroke="#52525b" />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "16px"
              }}
            >
              {taskCount}
            </span>
          </span>
        )}

        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full [&_svg]:h-4 [&_svg]:w-4 ${badge.bg} ${badge.iconColor}`}
          aria-label={badge.ariaLabel}
        >
          {badge.icon}
        </span>
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
