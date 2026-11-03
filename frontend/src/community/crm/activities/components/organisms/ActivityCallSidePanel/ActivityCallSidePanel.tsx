import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetCallById } from "~community/crm/api/ActivityApi";
import CallSidePanel from "~community/crm/components/organisms/CallSidePanel/CallSidePanel";
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

  const handleClose = () => {
    setSelectedCallId(null);
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

  const handleActionNotAvailable = (): void => {};

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

  return (
    <CallSidePanel
      call={call}
      isOpen={isOpen}
      onClose={handleClose}
      onEdit={handleActionNotAvailable}
      onDelete={handleActionNotAvailable}
      onContactClick={handleContactClick}
      onCompanyClick={handleCompanyClick}
    />
  );
};

export default ActivityCallSidePanel;
