import { SetType } from "~community/common/types/CommonTypes";
import { CrmTaskGroupEnum } from "~community/crm/enums/common";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmTaskSliceTypes } from "~community/crm/types/SliceTypes";
import { appendMissingById, mergeById } from "~community/crm/utils/crmUtil";
import {
  replaceTaskGroup,
  setTaskCompletionInList
} from "~community/crm/utils/taskUtil";

const CrmTaskSlice = (
  set: SetType<CrmTaskSliceTypes>,
  get: () => CrmTaskSliceTypes
) => ({
  isTaskModalOpen: false,
  taskModalType: CrmModalTypes.ADD_TASK_MODAL,
  selectedTaskId: null,
  tasks: [],
  setIsTaskModalOpen: (isTaskModalOpen: boolean) =>
    set({ isTaskModalOpen: isTaskModalOpen }),
  setTaskModalType: (taskModalType: CrmModalTypes) =>
    set({ taskModalType: taskModalType }),
  setSelectedTaskId: (selectedTaskId: number | null) =>
    set({ selectedTaskId: selectedTaskId }),
  setTasks: (fresh: CrmTaskDetailType[], group: CrmTaskGroupEnum) =>
    set({ tasks: replaceTaskGroup(get().tasks, fresh, group) }),
  addTasks: (tasks: CrmTaskDetailType[]) =>
    set({ tasks: appendMissingById(get().tasks, tasks) }),
  setTaskCompletion: (id: number, isCompleted: boolean) =>
    set({ tasks: setTaskCompletionInList(get().tasks, id, isCompleted) }),
  updateTask: (task: CrmTaskDetailType) =>
    set({ tasks: mergeById(get().tasks, task) }),
  getTaskById: (id: number) => get().tasks.find((task) => task.id === id)
});

export default CrmTaskSlice;
