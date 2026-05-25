import { SetType } from "~community/common/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmTaskModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmTaskModalSlice = (set: SetType<CrmTaskModalSliceTypes>) => ({
  isAddTaskModalOpen: false,
  taskModalType: CrmModalTypes.ADD_TASK_MODAL,
  setIsAddTaskModalOpen: (isAddTaskModalOpen: boolean) =>
    set({ isAddTaskModalOpen: isAddTaskModalOpen }),
  setTaskModalType: (taskModalType: CrmModalTypes) =>
    set({ taskModalType: taskModalType })
});

export default CrmTaskModalSlice;
