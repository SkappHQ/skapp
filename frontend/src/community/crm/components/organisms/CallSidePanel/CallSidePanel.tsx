import { PhoneFilledIcon } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityCallEditPayload } from "~community/crm/activities/types/activityTypes";
import SidePanelCallInfo from "~community/crm/components/molecules/SidePanelCallInfo/SidePanelCallInfo";
import ActivitySidePanel from "~community/crm/components/organisms/ActivitySidePanel/ActivitySidePanel";
import { TASK_DETAIL_ICON_SIZE } from "~community/crm/constants/taskConstants";
import { CrmCallEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  call?: CrmCallEntity;
  isOpen: boolean;
  onClose: () => void;
  related: ReactNode;
  onTitleSave: (title: string) => void;
  onCommentsSave: (comments: string) => void;
  onDealChange: (dealId: number | null) => void;
  onDetailsSave: (payload: ActivityCallEditPayload) => void;
  onDelete: () => void;
  onContactClick: (contactId: number) => void;
  onCompanyClick: (companyId: number) => void;
}

const CallSidePanel: FC<Props> = ({
  call,
  isOpen,
  onClose,
  related,
  onTitleSave,
  onCommentsSave,
  onDealChange,
  onDetailsSave,
  onDelete,
  onContactClick,
  onCompanyClick
}) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "callSidePanel"
  );
  const translateAria = useTranslator("crmAria", "activities", "callSidePanel");

  return (
    <ActivitySidePanel
      id="call"
      isOpen={isOpen}
      isLoading={!call}
      onClose={onClose}
      related={related}
      onTitleSave={onTitleSave}
      onCommentsSave={onCommentsSave}
      onDealChange={onDealChange}
      icon={
        <PhoneFilledIcon
          width={TASK_DETAIL_ICON_SIZE}
          height={TASK_DETAIL_ICON_SIZE}
        />
      }
      menuItems={[]}
      deleteLabel={translateText(["deleteCall"])}
      onDelete={onDelete}
      menuAriaLabel={translateAria(["kebabMenu"])}
      emptyDealsDescription={translateText(["noDealsDescription"])}
      {...(call && {
        title: call.subject,
        comments: call.comments,
        deal: call.deal,
        dealFilterCompanyId: call.contact?.companyId,
        info: (
          <SidePanelCallInfo
            key={call.id}
            call={call}
            onSave={onDetailsSave}
            onContactClick={onContactClick}
            onCompanyClick={onCompanyClick}
          />
        )
      })}
    />
  );
};

export default CallSidePanel;
