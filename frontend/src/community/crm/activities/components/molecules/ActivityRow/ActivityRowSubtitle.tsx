import { FC, Fragment } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { MAX_VISIBLE_ACTIVITY_ROW_CONTACTS } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityRow,
  ActivityRowSubtitlePart,
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
  const translateAria = useTranslator("crmAria");
  const contacts = useCrmStore((state) => state.contacts);

  const contactLinks = row.contactIds.flatMap((contactId) => {
    const name = getContactDisplayName(contacts[contactId]);

    return name ? [{ id: contactId, name }] : [];
  });
  const visibleContactLinks = contactLinks.slice(
    0,
    MAX_VISIBLE_ACTIVITY_ROW_CONTACTS
  );
  const hiddenContactCount = row.contactIds.length - visibleContactLinks.length;

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
    >
      {name}
    </span>
  );

  const parts: ActivityRowSubtitlePart[] = [
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
          {visibleContactLinks.map((contact, index) => (
            <Fragment key={contact.id}>
              {index > 0 && (
                <span className={`${nameColor} ${strikeClass}`}>,</span>
              )}
              {renderLink(contact.name, `${id}-contact-${contact.id}`)}
            </Fragment>
          ))}
          {hiddenContactCount > 0 && (
            <span
              id={`${id}-contact-more`}
              className={`shrink-0 ${nameColor} ${strikeClass}`}
            >
              <span aria-hidden="true">{`+${hiddenContactCount}`}</span>
              <span className="sr-only">
                {translateAria(["activities", "row", "moreContacts"], {
                  count: hiddenContactCount
                })}
              </span>
            </span>
          )}
        </span>
      )
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
