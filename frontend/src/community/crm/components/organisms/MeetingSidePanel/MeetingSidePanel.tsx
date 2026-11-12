import { MeetingFilledIcon } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityMeetingEditPayload } from "~community/crm/activities/types/activityTypes";
import SidePanelMeetingInfo from "~community/crm/components/molecules/SidePanelMeetingInfo/SidePanelMeetingInfo";
import ActivitySidePanel from "~community/crm/components/organisms/ActivitySidePanel/ActivitySidePanel";
import { TASK_DETAIL_ICON_SIZE } from "~community/crm/constants/taskConstants";
import { CrmMeetingEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  meeting?: CrmMeetingEntity;
  isOpen: boolean;
  onClose: () => void;
  related?: ReactNode;
  onTitleSave: (title: string) => void;
  onCommentsSave: (comments: string) => void;
  onDetailsSave: (payload: ActivityMeetingEditPayload) => void;
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
  onDetailsSave,
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
            key={meeting.id}
            meeting={meeting}
            onSave={onDetailsSave}
            onCompanyClick={onCompanyClick}
          />
        )
      })}
    />
  );
};

export default MeetingSidePanel;
