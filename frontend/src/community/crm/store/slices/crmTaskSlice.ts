import { SetType } from "~community/common/types/CommonTypes";
import {
  CrmTaskDetailType,
  PreselectedContact
} from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmTaskSliceTypes } from "~community/crm/types/SliceTypes";

const CrmTaskSlice = (
  set: SetType<CrmTaskSliceTypes>,
  get: () => CrmTaskSliceTypes
) => ({
  isTaskModalOpen: false,
  taskModalType: CrmModalTypes.ADD_TASK_MODAL,
  preselectedContact: null,
  selectedTaskId: null,
  tasks: [],
  setIsTaskModalOpen: (isTaskModalOpen: boolean) =>
    set({ isTaskModalOpen: isTaskModalOpen }),
  setTaskModalType: (taskModalType: CrmModalTypes) =>
    set({ taskModalType: taskModalType }),
  setPreselectedContact: (contact: PreselectedContact | null) =>
    set({ preselectedContact: contact }),
  setSelectedTaskId: (selectedTaskId: number | null) =>
    set({ selectedTaskId: selectedTaskId }),
  setTasks: (tasks: CrmTaskDetailType[]) => set({ tasks }),
  getTaskById: (id: number) => get().tasks.find((task) => task.id === id)
});

export default CrmTaskSlice;
