import { useCrmStore } from "~community/crm/store/store";
import { TaskRowResponseType } from "~community/crm/types/CommonTypes";

//This is a temp hook for existing store architecture. Once we migrate to new store architecture this will remove.
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
