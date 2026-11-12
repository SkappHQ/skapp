import { MeetingFilledIcon } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelMeetingInfo from "~community/crm/components/molecules/SidePanelMeetingInfo/SidePanelMeetingInfo";
import ActivitySidePanel from "~community/crm/components/organisms/ActivitySidePanel/ActivitySidePanel";
import { TASK_DETAIL_ICON_SIZE } from "~community/crm/constants/taskConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmMeetingEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  meeting?: CrmMeetingEntity;
  isOpen: boolean;
  onClose: () => void;
  related?: ReactNode;
  onTitleSave: (title: string) => void;
  onCommentsSave: (comments: string) => void;
  onDelete: () => void;
  onCompanyClick: () => void;
}

const MeetingSidePanel: FC<Props> = ({
  meeting,
  isOpen,
  onClose,
  related,
  onTitleSave,
  onCommentsSave,
  onDelete,
  onCompanyClick
}) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "meetingSidePanel"
  );
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "meetingSidePanel"
  );

  const owners = useCrmStore((state) => state.owners);

  return (
    <ActivitySidePanel
      id="meeting"
      isOpen={isOpen}
      isLoading={!meeting}
      onClose={onClose}
      related={related}
      onTitleSave={onTitleSave}
      onCommentsSave={onCommentsSave}
      icon={
        <MeetingFilledIcon
          width={TASK_DETAIL_ICON_SIZE}
          height={TASK_DETAIL_ICON_SIZE}
        />
      }
      menuItems={[]}
      deleteLabel={translateText(["deleteMeeting"])}
      onDelete={onDelete}
      menuAriaLabel={translateAria(["kebabMenu"])}
      emptyDealsDescription={translateText(["noDealsDescription"])}
      {...(meeting && {
        activityId: meeting.id,
        title: meeting.name,
        comments: meeting.comments,
        deal: meeting.deal,
        info: (
          <SidePanelMeetingInfo
            meeting={meeting}
            owner={owners[meeting.ownerId]}
            onCompanyClick={onCompanyClick}
          />
        )
      })}
    />
  );
};

export default MeetingSidePanel;
