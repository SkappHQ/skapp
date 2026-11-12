import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { toDealEditPayload } from "~community/crm/activities/utils/activityUtil";
import {
  useDeleteEmail,
  useGetEmailById,
  useUpdateEmail
} from "~community/crm/api/ActivityApi";
import DeleteActivityModal from "~community/crm/components/molecules/DeleteActivityModal/DeleteActivityModal";
import EmailActivitySidePanel from "~community/crm/components/organisms/EmailActivitySidePanel/EmailActivitySidePanel";
import { useActivitySidePanelActions } from "~community/crm/hooks/useActivitySidePanelActions";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";

interface Props {
  emailId: number;
}

const ActivityEmailSidePanel: FC<Props> = ({ emailId }) => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();
  const router = useRouter();

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    setSelectedEmailId,
    closeCrmSidePanel
  } = useCrmStore(
    useShallow((state) => ({
      isCrmSidePanelOpen: state.isCrmSidePanelOpen,
      crmSidePanelType: state.crmSidePanelType,
      setSelectedEmailId: state.setSelectedEmailId,
      closeCrmSidePanel: state.closeCrmSidePanel
    }))
  );

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.EMAIL_SIDE_PANEL;

  const { data: email, isError, isFetching } = useGetEmailById(emailId, isOpen);

  const handleClose = (): void => {
    setSelectedEmailId(null);
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

  const { mutate: updateEmail } = useUpdateEmail(handleSaveError);
  const { mutate: deleteEmail, isPending: isDeleting } = useDeleteEmail(
    handleDeleteSuccess,
    handleDeleteError
  );

  useEffect(() => {
    if (!isError || isFetching) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["common", "initData", "errorTitle"]),
      description: translateText(["common", "initData", "errorDescription"]),
      isIcon: true
    });
    handleClose();
  }, [isError, isFetching]);

  const handleCompanyClick = (companyId: number): void => {
    handleClose();
    router.push(ROUTES.CRM.COMPANY_DETAIL(companyId));
  };

  return (
    <>
      <EmailActivitySidePanel
        {...(email && { email })}
        isOpen={isOpen}
        onClose={handleClose}
        onTitleSave={(subject) => updateEmail({ id: emailId, subject })}
        onCommentsSave={(description) =>
          updateEmail({ id: emailId, description })
        }
        onDealChange={(dealId) =>
          updateEmail(toDealEditPayload(emailId, dealId))
        }
        onDetailsSave={updateEmail}
        onDelete={openDeleteModal}
        onCompanyClick={handleCompanyClick}
      />
      <DeleteActivityModal
        isOpen={isDeleteModalOpen}
        isPending={isDeleting}
        onConfirm={() => deleteEmail(emailId)}
        onClose={closeDeleteModal}
      />
    </>
  );
};

export default ActivityEmailSidePanel;
