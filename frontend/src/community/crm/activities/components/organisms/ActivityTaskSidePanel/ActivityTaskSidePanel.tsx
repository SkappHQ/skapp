import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetActivityTaskById } from "~community/crm/api/ActivityApi";
import TaskActivitySidePanel from "~community/crm/components/organisms/TaskActivitySidePanel/TaskActivitySidePanel";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";

interface Props {
  taskId: number;
}

const ActivityTaskSidePanel: FC<Props> = ({ taskId }) => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();
  const router = useRouter();

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    setSelectedActivityTaskId,
    closeCrmSidePanel
  } = useCrmStore(
    useShallow((state) => ({
      isCrmSidePanelOpen: state.isCrmSidePanelOpen,
      crmSidePanelType: state.crmSidePanelType,
      setSelectedActivityTaskId: state.setSelectedActivityTaskId,
      closeCrmSidePanel: state.closeCrmSidePanel
    }))
  );

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.ACTIVITY_TASK_SIDE_PANEL;

  const {
    data: task,
    isError,
    isFetching
  } = useGetActivityTaskById(taskId, isOpen);

  const handleClose = (): void => {
    setSelectedActivityTaskId(null);
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

  const openRecord = (url: string): void => {
    handleClose();
    router.push(url);
  };

  const handleContactClick = (): void => {
    if (task?.contact?.id) {
      openRecord(ROUTES.CRM.CONTACT_DETAIL(task.contact.id));
    }
  };

  const handleCompanyClick = (): void => {
    if (task?.company?.id) {
      openRecord(ROUTES.CRM.COMPANY_DETAIL(task.company.id));
    }
  };

  return (
    <TaskActivitySidePanel
      {...(task && { task })}
      isOpen={isOpen}
      onClose={handleClose}
      onDelete={handleActionNotAvailable}
      onContactClick={handleContactClick}
      onCompanyClick={handleCompanyClick}
    />
  );
};

export default ActivityTaskSidePanel;
