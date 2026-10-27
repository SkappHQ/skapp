import { FC, Fragment, ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  ActivityRow,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { getRowSubtitle } from "~community/crm/activities/utils/activityFeedUtil";
import { useCrmStore } from "~community/crm/store/store";
import { getContactDisplayName } from "~community/crm/utils/contactUtil";
import { isOverdue } from "~community/crm/utils/taskValidations";

interface SubtitlePart {
  key: string;
  isVisible: boolean;
  content: ReactNode;
}

interface ActivityRowSubtitleProps {
  id: string;
  row: ActivityRow;
  isCompletedStyleApplied: boolean;
  isStrikethroughApplied: boolean;
  timeZone?: string;
}

const ActivityRowSubtitle: FC<ActivityRowSubtitleProps> = ({
  id,
  row,
  isCompletedStyleApplied,
  isStrikethroughApplied,
  timeZone
}) => {
  const translateText = useTranslator("crmModule");
  const { contacts, deals } = useCrmStore(
    useShallow((state) => ({
      contacts: state.contacts,
      deals: state.deals
    }))
  );

  const contactLinks = row.contactIds.flatMap((contactId) => {
    const name = getContactDisplayName(contacts[contactId]);

    return name ? [{ id: contactId, name }] : [];
  });
  const dealName = deals[row.dealId ?? 0]?.name ?? "";

  const isRowOverdue =
    row.type === ActivityType.TASK &&
    !row.isCompleted &&
    row.dueAt !== null &&
    isOverdue(row.dueAt, timeZone);

  const status = getRowSubtitle(row, translateText, timeZone);
  const strikeClass = isStrikethroughApplied ? "line-through" : "";
  const nameColor = isCompletedStyleApplied
    ? "text-secondary-icon"
    : "text-secondary-text";
  const statusColor = isRowOverdue ? "text-semantic-red-text" : nameColor;

  const renderLink = (name: string, linkId: string) => (
    <span
      id={linkId}
      className={`min-w-0 truncate ${nameColor} ${strikeClass}`}
      title={name}
    >
      {name}
    </span>
  );

  const parts: SubtitlePart[] = [
    {
      key: "status",
      isVisible: Boolean(status),
      content: (
        <span
          id={`${id}-status`}
          className={`shrink-0 ${statusColor} ${strikeClass}`}
        >
          {status}
        </span>
      )
    },
    {
      key: "contacts",
      isVisible: contactLinks.length > 0,
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
    },
    {
      key: "deal",
      isVisible: Boolean(dealName),
      content: renderLink(dealName, `${id}-deal-${row.dealId}`)
    }
  ];
  const visibleParts = parts.filter((part) => part.isVisible);

  if (visibleParts.length === 0) return null;

  return (
    <span
      id={id}
      className="body3 leading-none mt-0.5 flex min-w-0 items-center gap-2"
    >
      {visibleParts.map((part, index) => (
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
    </span>
  );
};

export default ActivityRowSubtitle;
