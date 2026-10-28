import { SidePanel } from "@rootcodelabs/skapp-ui";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetCallById } from "~community/crm/api/ActivityApi";
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import CallSidePanel from "~community/crm/components/organisms/CallSidePanel/CallSidePanel";
import CallSidePanelSkeleton from "~community/crm/components/organisms/CallSidePanel/CallSidePanelSkeleton";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";

interface Props {
  callId: number;
}

const ActivityCallSidePanel: FC<Props> = ({ callId }) => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();

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

  const handleActionNotAvailable = (): void => {
    return;
  };

  if (!call) {
    return (
      <SidePanel
        isOpen={isOpen}
        onClose={handleClose}
        closeOnBackdropClick
        header={<SidePanelHeaderSkeleton isShowLastUpdate={false} />}
        headerActions={<SidePanelHeaderActionsSkeleton />}
      >
        <div aria-busy="true">
          <CallSidePanelSkeleton />
        </div>
      </SidePanel>
    );
  }

  return (
    <CallSidePanel
      call={call}
      isOpen={isOpen}
      onClose={handleClose}
      onEdit={handleActionNotAvailable}
      onDelete={handleActionNotAvailable}
      onContactClick={handleActionNotAvailable}
      onCompanyClick={handleActionNotAvailable}
    />
  );
};

export default ActivityCallSidePanel;
