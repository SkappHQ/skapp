import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetMeetingById } from "~community/crm/api/ActivityApi";
import MeetingSidePanel from "~community/crm/components/organisms/MeetingSidePanel/MeetingSidePanel";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";

interface Props {
  meetingId: number;
}

const ActivityMeetingSidePanel: FC<Props> = ({ meetingId }) => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();
  const router = useRouter();

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    setSelectedMeetingId,
    closeCrmSidePanel
  } = useCrmStore(
    useShallow((state) => ({
      isCrmSidePanelOpen: state.isCrmSidePanelOpen,
      crmSidePanelType: state.crmSidePanelType,
      setSelectedMeetingId: state.setSelectedMeetingId,
      closeCrmSidePanel: state.closeCrmSidePanel
    }))
  );

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.MEETING_SIDE_PANEL;

  const { data: meeting, isError } = useGetMeetingById(meetingId, isOpen);

  const handleClose = (): void => {
    setSelectedMeetingId(null);
    closeCrmSidePanel();
  };

  useEffect(() => {
    if (!isError) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["common", "initData", "errorTitle"]),
      description: translateText(["common", "initData", "errorDescription"]),
      isIcon: true
    });
    handleClose();
  }, [isError]);

  const handleDelete = (): void => {};

  const handleCompanyClick = (): void => {
    if (meeting?.company?.id) {
      handleClose();
      router.push(ROUTES.CRM.COMPANY_DETAIL(meeting.company.id));
    }
  };

  return (
    <MeetingSidePanel
      {...(meeting && { meeting })}
      isOpen={isOpen}
      onClose={handleClose}
      onDelete={handleDelete}
      onCompanyClick={handleCompanyClick}
    />
  );
};

export default ActivityMeetingSidePanel;
