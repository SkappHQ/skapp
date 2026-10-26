import { FC, Fragment, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  ActivityRelatedAssociation,
  ActivityRow
} from "~community/crm/activities/types/activityTypes";
import {
  getRelatedAssociationLabel,
  getRowSubtitle,
  isRowOverdue
} from "~community/crm/activities/utils/activityFeedUtil";

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

  const status = getRowSubtitle(row, translateText, timeZone);
  const strikeClass = isCompletedStyleApplied ? "line-through" : "";
  const statusColor = isRowOverdue(row, timeZone)
    ? "text-semantic-red-text"
    : isCompletedStyleApplied
      ? "text-secondary-icon"
      : "text-secondary-text";
  const nameColor = isCompletedStyleApplied
    ? "text-secondary-icon"
    : "text-secondary-text";

  const renderLink = (link: ActivityRelatedAssociation, linkId: string) => {
    const label = getRelatedAssociationLabel(link, translateText);

    return (
      <span
        id={linkId}
        className={`min-w-0 truncate ${
          link.deleted ? "text-secondary-icon" : nameColor
        } ${strikeClass}`}
        title={label}
      >
        {label}
      </span>
    );
  };

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

  if (row.contacts.length > 0) {
    parts.push({
      key: "contacts",
      content: (
        <span className="flex min-w-0 items-center gap-1">
          {row.contacts.map((contact, index) => (
            <Fragment key={contact.id}>
              {index > 0 && (
                <span className={`${nameColor} ${strikeClass}`}>,</span>
              )}
              {renderLink(contact, `${id}-contact-${contact.id}`)}
            </Fragment>
          ))}
        </span>
      )
    });
  }

  if (row.deal) {
    parts.push({
      key: "deal",
      content: renderLink(row.deal, `${id}-deal-${row.deal.id}`)
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
