import { SetType } from "~community/common/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmTaskSliceTypes } from "~community/crm/types/SliceTypes";
import { CrmTaskType } from "~community/crm/types/CommonTypes";

const CrmTaskSlice = (set: SetType<CrmTaskSliceTypes>) => ({
  isTaskModalOpen: false,
  taskModalType: CrmModalTypes.ADD_TASK_MODAL,
  selectedTask: null as CrmTaskType | null,
  setIsTaskModalOpen: (isTaskModalOpen: boolean) =>
    set({ isTaskModalOpen: isTaskModalOpen }),
  setTaskModalType: (taskModalType: CrmModalTypes) =>
    set({ taskModalType: taskModalType }),
  setSelectedTask: (selectedTask: CrmTaskType | null) =>
    set({ selectedTask: selectedTask })
});

export default CrmTaskSlice;
