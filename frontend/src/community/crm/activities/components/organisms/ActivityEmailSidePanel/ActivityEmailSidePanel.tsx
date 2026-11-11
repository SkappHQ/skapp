import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetEmailById } from "~community/crm/api/ActivityApi";
import EmailActivitySidePanel from "~community/crm/components/organisms/EmailActivitySidePanel/EmailActivitySidePanel";
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

  const handleActionNotAvailable = (): void => {};

  const handleCompanyClick = (): void => {
    if (email?.company?.id) {
      handleClose();
      router.push(ROUTES.CRM.COMPANY_DETAIL(email.company.id));
    }
  };

  return (
    <EmailActivitySidePanel
      {...(email && { email })}
      isOpen={isOpen}
      onClose={handleClose}
      onDelete={handleActionNotAvailable}
      onCompanyClick={handleCompanyClick}
    />
  );
};

export default ActivityEmailSidePanel;
