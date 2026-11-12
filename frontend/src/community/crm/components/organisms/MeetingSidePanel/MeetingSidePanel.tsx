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
  related: ReactNode;
  onTitleSave: (title: string) => void;
  onCommentsSave: (comments: string) => void;
  onDealChange: (dealId: number | null) => void;
  onDetailsSave: (payload: ActivityMeetingEditPayload) => void;
  onDelete: () => void;
  onCompanyClick: (companyId: number) => void;
}

const MeetingSidePanel: FC<Props> = ({
  meeting,
  isOpen,
  onClose,
  related,
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
    "meetingSidePanel"
  );
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "meetingSidePanel"
  );

  const attendeeCompanyIds = meeting
    ? Array.from(
        new Set(
          meeting.contacts.flatMap((contact) =>
            contact.companyId ? [contact.companyId] : []
          )
        )
      )
    : [];

  return (
    <ActivitySidePanel
      id="meeting"
      isOpen={isOpen}
      isLoading={!meeting}
      onClose={onClose}
      related={related}
      onTitleSave={onTitleSave}
      onCommentsSave={onCommentsSave}
      onDealChange={onDealChange}
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
        title: meeting.name,
        comments: meeting.comments,
        deal: meeting.deal,
        dealFilterCompanyId:
          attendeeCompanyIds.length === 1 ? attendeeCompanyIds[0] : null,
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
