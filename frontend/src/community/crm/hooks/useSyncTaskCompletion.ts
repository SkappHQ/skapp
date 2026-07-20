import { useCrmStore } from "~community/crm/store/store";
import { TaskRowResponseType } from "~community/crm/types/CommonTypes";

export const useSyncTaskCompletion = () => {
  const {
    setTaskCompletion,
    updateContactTaskCompletion,
    updateCompanyTaskCompletion
  } = useCrmStore((store) => ({
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
      updateCompanyTaskCompletion(
        task.contact.company.id,
        task.id,
        isCompleted
      );
    }
  };
};
