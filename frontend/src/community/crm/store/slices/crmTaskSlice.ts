import { SetType } from "~community/common/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmTaskSliceTypes } from "~community/crm/types/SliceTypes";

const CrmTaskSlice = (set: SetType<CrmTaskSliceTypes>) => ({
  isTaskModalOpen: false,
  taskModalType: CrmModalTypes.ADD_TASK_MODAL,
  setIsTaskModalOpen: (isTaskModalOpen: boolean) =>
    set({ isTaskModalOpen: isTaskModalOpen }),
  setTaskModalType: (taskModalType: CrmModalTypes) =>
    set({ taskModalType: taskModalType })
});

export default CrmTaskSlice;
