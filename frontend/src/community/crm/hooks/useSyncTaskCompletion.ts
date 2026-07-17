import { useCrmStore } from "~community/crm/store/store";
import { TaskRowResponseType } from "~community/crm/types/CommonTypes";

/**
 * Flips a task's completion across every store that holds it: the tasks-page
 * list, the owning contact and the owning company. Each store updates in place
 * only, so a store that doesn't currently hold the task is left untouched.
 *
 * Shared by the checkbox (TaskRow) and the mark-as-done button (TaskSidePanel).
 * `CrmTaskDetailType` is assignable to `TaskRowResponseType`, so both callers
 * pass their task object directly.
 */
export const useSyncTaskCompletion = () => {
  const { setTaskCompletion, updateContactTaskCompletion, updateCompanyTaskCompletion } =
    useCrmStore((store) => ({
      setTaskCompletion: store.setTaskCompletion,
      updateContactTaskCompletion: store.updateContactTaskCompletion,
      updateCompanyTaskCompletion: store.updateCompanyTaskCompletion
    }));

  return (task: TaskRowResponseType, isCompleted: boolean) => {
    setTaskCompletion(task.id, isCompleted);
    if (task.contact) {
      updateContactTaskCompletion(task.contact.id, task.id, isCompleted);
    }
    if (task.contact?.company) {
      updateCompanyTaskCompletion(task.contact.company.id, task.id, isCompleted);
    }
  };
};
