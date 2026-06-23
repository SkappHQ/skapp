import {
  Avatar,
  Chip,
  ClipboardCheckIcon,
  DealValueIcon,
  HandshakeIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import PriorityLabel from "~community/crm/components/atoms/PriorityLabel/PriorityLabel";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { CrmOwner } from "~community/crm/types/CommonTypes";
import { formatValue } from "~community/crm/utils/crmUtil";

export interface DealCardProps {
  id: string;
  title: string;
  contactName: string;
  companyName?: string;
  owner: CrmOwner;
  amount?: string;
  priority: CrmPriorityEnum | null;
  taskCount?: number;
  ariaLabel?: string;
  onClick?: () => void;
}

const DealCard: FC<DealCardProps> = ({
  id,
  title,
  contactName,
  companyName,
  owner,
  amount,
  priority,
  taskCount,
  ariaLabel,
  onClick
}) => {
  const imageUrl = useGetImageUrl(owner?.authPic ?? "");

  return (
    <div
      className={`flex min-h-37.5 w-full flex-col gap-3 rounded-lg bg-white px-2 py-3 text-left shadow-md`}
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
            className="h-6 w-6"
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <button
          type="button"
          className="body2 cursor-pointer text-left hover:text-primary-text hover:underline"
          onClick={onClick}
        >
          {title}
        </button>

        {(contactName || companyName) && (
          <div className="body3 flex items-center gap-1 truncate text-secondary-icon">
            {contactName && <span>{contactName}</span>}
            {contactName && companyName && (
              <div className="size-1 shrink-0 rounded-full bg-secondary-accent" />
            )}
            {companyName && <span>{companyName}</span>}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="shrink-0 text-secondary-icon">
            <DealValueIcon className="h-4 w-4" />
          </span>
          <span className="body3">
            {amount ? formatValue(String(amount)) : ""}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {taskCount != null && (
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
            className="h-6 w-12 bg-label-bg-slate text-label-text-slate"
          />
        )}

        {priority && <PriorityLabel priority={priority} />}
      </div>
    </div>
  );
};

export default DealCard;
