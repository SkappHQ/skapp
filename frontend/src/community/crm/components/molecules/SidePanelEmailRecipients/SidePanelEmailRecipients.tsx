import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmContactEntity } from "~community/crm/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/utils/contactUtil";

interface Props {
  id: string;
  title: string;
  ariaLabel: string;
  recipients: CrmContactEntity[];
}

const SidePanelEmailRecipients: FC<Props> = ({
  id,
  title,
  ariaLabel,
  recipients
}) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "activitySidePanel",
    "info"
  );

  return (
    <div className="flex flex-col gap-2 border border-secondary-accent rounded-xl p-3">
      <p className="subtitle1">{title}</p>
      {recipients.length > 0 ? (
        <ul aria-label={ariaLabel} className="flex flex-wrap gap-2">
          {recipients.map((recipient) => {
            const recipientName = getContactDisplayName(recipient);
            const [firstName, lastName] = recipientName.split(" ");

            return (
              <li key={recipient.id}>
                <AvatarChip
                  avatarProps={{
                    id: `${id}-${recipient.id}`,
                    firstName,
                    lastName,
                    size: "xs"
                  }}
                  label={recipientName}
                  backgroundColor="bg-tertiary-background"
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <span className="body2">{translateText(["noLongerAvailable"])}</span>
      )}
    </div>
  );
};

export default SidePanelEmailRecipients;
