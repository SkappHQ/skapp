import { EmailFilledIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityEmailEditPayload } from "~community/crm/activities/types/activityTypes";
import SidePanelActivityEmailInfo from "~community/crm/components/molecules/SidePanelActivityEmailInfo/SidePanelActivityEmailInfo";
import ActivitySidePanel from "~community/crm/components/organisms/ActivitySidePanel/ActivitySidePanel";
import { TASK_DETAIL_ICON_SIZE } from "~community/crm/constants/taskConstants";
import { CrmActivityEmailEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  email?: CrmActivityEmailEntity;
  isOpen: boolean;
  onClose: () => void;
  onTitleSave: (title: string) => void;
  onCommentsSave: (comments: string) => void;
  onDealChange: (dealId: number | null) => void;
  onDetailsSave: (payload: ActivityEmailEditPayload) => void;
  onDelete: () => void;
  onCompanyClick: (companyId: number) => void;
}

const EmailActivitySidePanel: FC<Props> = ({
  email,
  isOpen,
  onClose,
  onTitleSave,
  onCommentsSave,
  onDealChange,
  onDetailsSave,
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

  return (
    <ActivitySidePanel
      id="activity-email"
      isOpen={isOpen}
      isLoading={!email}
      onClose={onClose}
      onTitleSave={onTitleSave}
      onCommentsSave={onCommentsSave}
      onDealChange={onDealChange}
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
      commentsAriaLabel={translateAria(["description"])}
      editCommentsAriaLabel={translateAria(["editDescription"])}
      {...(email && {
        title: email.subject,
        comments: email.description,
        deal: email.deal,
        info: (
          <SidePanelActivityEmailInfo
            key={email.id}
            email={email}
            onSave={onDetailsSave}
            onCompanyClick={onCompanyClick}
          />
        )
      })}
    />
  );
};

export default EmailActivitySidePanel;
