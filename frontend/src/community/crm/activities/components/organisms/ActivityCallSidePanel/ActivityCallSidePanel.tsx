import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ActivityRow } from "~community/crm/activities/types/activityTypes";
import { toCallRow } from "~community/crm/activities/utils/activityFeedUtil";
import {
  useDeleteCall,
  useGetCallById,
  useGetRelatedCalls,
  useUpdateCall
} from "~community/crm/api/ActivityApi";
import DeleteActivityModal from "~community/crm/components/molecules/DeleteActivityModal/DeleteActivityModal";
import SidePanelRelatedActivities from "~community/crm/components/molecules/SidePanelRelatedActivities/SidePanelRelatedActivities";
import CallSidePanel from "~community/crm/components/organisms/CallSidePanel/CallSidePanel";
import { useActivitySidePanelActions } from "~community/crm/hooks/useActivitySidePanelActions";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";

interface Props {
  callId: number;
}

const ActivityCallSidePanel: FC<Props> = ({ callId }) => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();
  const router = useRouter();

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    setSelectedCallId,
    closeCrmSidePanel
  } = useCrmStore(
    useShallow((state) => ({
      isCrmSidePanelOpen: state.isCrmSidePanelOpen,
      crmSidePanelType: state.crmSidePanelType,
      setSelectedCallId: state.setSelectedCallId,
      closeCrmSidePanel: state.closeCrmSidePanel
    }))
  );

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.CALL_SIDE_PANEL;

  const { data: call, isError } = useGetCallById(callId, isOpen);
  const { data: relatedCalls } = useGetRelatedCalls(callId, isOpen);

  const handleClose = () => {
    setSelectedCallId(null);
    closeCrmSidePanel();
  };

  const {
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    handleSaveError,
    handleDeleteSuccess,
    handleDeleteError
  } = useActivitySidePanelActions(handleClose);

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

  const { mutate: updateCall } = useUpdateCall(handleSaveError);
  const { mutate: deleteCall, isPending: isDeleting } = useDeleteCall(
    handleDeleteSuccess,
    handleDeleteError
  );

  const openRecord = (url: string): void => {
    handleClose();
    router.push(url);
  };

  const handleContactClick = (): void => {
    if (call?.contact?.id) {
      openRecord(ROUTES.CRM.CONTACT_DETAIL(call.contact.id));
    }
  };

  const handleCompanyClick = (): void => {
    if (call?.company?.id) {
      openRecord(ROUTES.CRM.COMPANY_DETAIL(call.company.id));
    }
  };

  const handleRelatedRowClick = (row: ActivityRow): void => {
    setSelectedCallId(row.id);
  };

  return (
    <>
      <CallSidePanel
        call={call}
        isOpen={isOpen}
        onClose={handleClose}
        related={
          relatedCalls &&
          relatedCalls.length > 0 && (
            <SidePanelRelatedActivities
              title={translateText([
                "activities",
                "callSidePanel",
                "relatedTitle"
              ])}
              rows={(relatedCalls ?? []).map(toCallRow)}
              onRowClick={handleRelatedRowClick}
            />
          )
        }
        onTitleSave={(subject) => updateCall({ id: callId, subject })}
        onCommentsSave={(comments) => updateCall({ id: callId, comments })}
        onDelete={openDeleteModal}
        onContactClick={handleContactClick}
        onCompanyClick={handleCompanyClick}
      />
      <DeleteActivityModal
        isOpen={isDeleteModalOpen}
        isPending={isDeleting}
        onConfirm={() => deleteCall(callId)}
        onClose={closeDeleteModal}
      />
    </>
  );
};

export default ActivityCallSidePanel;
