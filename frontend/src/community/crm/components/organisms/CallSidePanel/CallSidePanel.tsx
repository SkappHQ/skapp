import { EditIcon, PhoneFilledIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelCallInfo from "~community/crm/components/molecules/SidePanelCallInfo/SidePanelCallInfo";
import ActivitySidePanel from "~community/crm/components/organisms/ActivitySidePanel/ActivitySidePanel";
import { TASK_DETAIL_ICON_SIZE } from "~community/crm/constants/taskConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCallEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  call?: CrmCallEntity;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onContactClick: () => void;
  onCompanyClick: () => void;
}

const CallSidePanel: FC<Props> = ({
  call,
  isOpen,
  onClose,
  onEdit,
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

  const owners = useCrmStore((state) => state.owners);

  return (
    <ActivitySidePanel
      id="call"
      isOpen={isOpen}
      isLoading={!call}
      onClose={onClose}
      icon={
        <PhoneFilledIcon
          width={TASK_DETAIL_ICON_SIZE}
          height={TASK_DETAIL_ICON_SIZE}
        />
      }
      menuItems={[
        {
          id: "edit",
          label: translateText(["editCall"]),
          icon: { start: <EditIcon width="16px" height="16px" /> },
          onClick: onEdit
        }
      ]}
      deleteLabel={translateText(["deleteCall"])}
      onDelete={onDelete}
      menuAriaLabel={translateAria(["kebabMenu"])}
      emptyDealsDescription={translateText(["noDealsDescription"])}
      {...(call && {
        title: call.subject,
        comments: call.comments,
        deal: call.deal,
        info: (
          <SidePanelCallInfo
            call={call}
            owner={owners[call.ownerId]}
            onContactClick={onContactClick}
            onCompanyClick={onCompanyClick}
          />
        )
      })}
    />
  );
};

export default CallSidePanel;
