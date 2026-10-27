import { FC, Fragment, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  ActivityRow,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { getRowSubtitle } from "~community/crm/activities/utils/activityFeedUtil";
import { useCrmStore } from "~community/crm/store/store";
import { getContactDisplayName } from "~community/crm/utils/contactUtil";
import { isOverdue } from "~community/crm/utils/taskValidations";

interface ActivityRowSubtitleProps {
  id: string;
  row: ActivityRow;
  isCompletedStyleApplied: boolean;
  timeZone?: string;
}

const ActivityRowSubtitle: FC<ActivityRowSubtitleProps> = ({
  id,
  row,
  isCompletedStyleApplied,
  timeZone
}) => {
  const translateText = useTranslator("crmModule");
  const contacts = useCrmStore((state) => state.contacts);
  const deals = useCrmStore((state) => state.deals);

  const contactLinks = row.contactIds.flatMap((contactId) => {
    const name = getContactDisplayName(contacts[contactId]);

    return name ? [{ id: contactId, name }] : [];
  });
  const dealName = row.dealId != null ? deals[row.dealId]?.name : undefined;

  const isRowOverdue =
    row.type === ActivityType.TASK &&
    !row.isCompleted &&
    row.dueAt !== null &&
    isOverdue(row.dueAt, timeZone);

  const status = getRowSubtitle(row, translateText, timeZone);
  const strikeClass = isCompletedStyleApplied ? "line-through" : "";
  const statusColor = isRowOverdue
    ? "text-semantic-red-text"
    : isCompletedStyleApplied
      ? "text-secondary-icon"
      : "text-secondary-text";
  const nameColor = isCompletedStyleApplied
    ? "text-secondary-icon"
    : "text-secondary-text";

  const renderLink = (name: string, linkId: string) => (
    <span
      id={linkId}
      className={`min-w-0 truncate ${nameColor} ${strikeClass}`}
      title={name}
    >
      {name}
    </span>
  );

  const parts: { key: string; content: ReactNode }[] = [];

  if (status) {
    parts.push({
      key: "status",
      content: (
        <span
          id={`${id}-status`}
          className={`shrink-0 ${statusColor} ${strikeClass}`}
        >
          {status}
        </span>
      )
    });
  }

  if (contactLinks.length > 0) {
    parts.push({
      key: "contacts",
      content: (
        <span className="flex min-w-0 items-center gap-1">
          {contactLinks.map((contact, index) => (
            <Fragment key={contact.id}>
              {index > 0 && (
                <span className={`${nameColor} ${strikeClass}`}>,</span>
              )}
              {renderLink(contact.name, `${id}-contact-${contact.id}`)}
            </Fragment>
          ))}
        </span>
      )
    });
  }

  if (dealName) {
    parts.push({
      key: "deal",
      content: renderLink(dealName, `${id}-deal-${row.dealId}`)
    });
  }

  if (parts.length === 0) return null;

  return (
    <div
      id={id}
      className="body3 leading-none mt-0.5 flex min-w-0 items-center gap-2"
    >
      {parts.map((part, index) => (
        <Fragment key={part.key}>
          {index > 0 && (
            <span
              aria-hidden="true"
              className="w-1 h-1 rounded-full bg-border-surface-secondary shrink-0"
            />
          )}
          {part.content}
        </Fragment>
      ))}
    </div>
  );
};

export default ActivityRowSubtitle;
