import { EmailFilledIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelActivityEmailInfo from "~community/crm/components/molecules/SidePanelActivityEmailInfo/SidePanelActivityEmailInfo";
import ActivitySidePanel from "~community/crm/components/organisms/ActivitySidePanel/ActivitySidePanel";
import { TASK_DETAIL_ICON_SIZE } from "~community/crm/constants/taskConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmActivityEmailEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  email?: CrmActivityEmailEntity;
  isOpen: boolean;
  onClose: () => void;
  onTitleSave: (title: string) => void;
  onCommentsSave: (comments: string) => void;
  onDelete: () => void;
  onCompanyClick: () => void;
}

const EmailActivitySidePanel: FC<Props> = ({
  email,
  isOpen,
  onClose,
  onTitleSave,
  onCommentsSave,
  onDelete,
  onCompanyClick
}) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "emailSidePanel"
  );
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "emailSidePanel"
  );

  const owners = useCrmStore((state) => state.owners);

  return (
    <ActivitySidePanel
      id="activity-email"
      isOpen={isOpen}
      isLoading={!email}
      onClose={onClose}
      onTitleSave={onTitleSave}
      onCommentsSave={onCommentsSave}
      icon={
        <EmailFilledIcon
          width={TASK_DETAIL_ICON_SIZE}
          height={TASK_DETAIL_ICON_SIZE}
        />
      }
      menuItems={[]}
      deleteLabel={translateText(["deleteEmail"])}
      onDelete={onDelete}
      menuAriaLabel={translateAria(["kebabMenu"])}
      emptyDealsDescription={translateText(["noDealsDescription"])}
      commentsTitle={translateText(["description"])}
      emptyCommentsText={translateText(["noDescription"])}
      {...(email && {
        title: email.subject,
        comments: email.description,
        deal: email.deal,
        info: (
          <SidePanelActivityEmailInfo
            email={email}
            owner={owners[email.ownerId]}
            onCompanyClick={onCompanyClick}
          />
        )
      })}
    />
  );
};

export default EmailActivitySidePanel;
