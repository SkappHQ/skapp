import { SetType } from "~community/common/types/CommonTypes";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmTaskSliceTypes } from "~community/crm/types/SliceTypes";

const CrmTaskSlice = (set: SetType<CrmTaskSliceTypes>) => ({
  isTaskModalOpen: false,
  taskModalType: CrmModalTypes.ADD_TASK_MODAL,
  selectedTask: null as CrmTaskDetailType | null,
  setIsTaskModalOpen: (isTaskModalOpen: boolean) =>
    set({ isTaskModalOpen: isTaskModalOpen }),
  setTaskModalType: (taskModalType: CrmModalTypes) =>
    set({ taskModalType: taskModalType }),
  setSelectedTask: (selectedTask: CrmTaskDetailType | null) =>
    set({ selectedTask: selectedTask })
});

export default CrmTaskSlice;
