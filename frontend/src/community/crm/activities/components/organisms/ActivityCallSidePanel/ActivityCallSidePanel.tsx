import { SidePanel } from "@rootcodelabs/skapp-ui";
import { FC, useEffect } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetCallById } from "~community/crm/api/ActivityApi";
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import CallSidePanel from "~community/crm/components/organisms/CallSidePanel/CallSidePanel";
import TaskSidePanelSkeleton from "~community/crm/components/organisms/TaskSidePanel/TaskSidePanelSkeleton";

interface Props {
  callId: number;
  onClose: () => void;
}

const ActivityCallSidePanel: FC<Props> = ({ callId, onClose }) => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();

  const { data: call, isError } = useGetCallById(callId, true);

  useEffect(() => {
    if (!isError) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["common", "initData", "errorTitle"]),
      description: translateText(["common", "initData", "errorDescription"]),
      isIcon: true
    });
    onClose();
  }, [isError]);

  const handleActionNotAvailable = (): void => {
    return;
  };

  if (!call) {
    return (
      <SidePanel
        isOpen
        onClose={onClose}
        closeOnBackdropClick
        header={<SidePanelHeaderSkeleton isShowLastUpdate={false} />}
        headerActions={<SidePanelHeaderActionsSkeleton />}
      >
        <div aria-busy="true">
          <TaskSidePanelSkeleton />
        </div>
      </SidePanel>
    );
  }

  return (
    <CallSidePanel
      call={call}
      isOpen
      onClose={onClose}
      onEdit={handleActionNotAvailable}
      onDelete={handleActionNotAvailable}
      onContactClick={handleActionNotAvailable}
      onCompanyClick={handleActionNotAvailable}
    />
  );
};

export default ActivityCallSidePanel;
