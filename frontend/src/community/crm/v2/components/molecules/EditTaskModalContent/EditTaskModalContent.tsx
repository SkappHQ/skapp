import { useFormik } from "formik";
import { FC, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTask } from "~community/crm/v2/api/TaskApi";
import TaskModalForm from "~community/crm/v2/components/molecules/TaskModalForm/TaskModalForm";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  getChangedTaskFields,
  mergeTasks
} from "~community/crm/v2/utils/taskUtil";
import { taskValidations } from "~community/crm/v2/utils/taskValidations";

const EditTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "editTaskModal");

  const { setIsTaskModalOpen, selectedTaskId, selectedTask, tasks, setTasks } =
    useCrmStoreV2(
      useShallow((store) => ({
        setIsTaskModalOpen: store.setIsTaskModalOpen,
        selectedTaskId: store.selectedTaskId,
        selectedTask:
          store.selectedTaskId != null
            ? store.tasks[store.selectedTaskId]
            : undefined,
        tasks: store.tasks,
        setTasks: store.setTasks
      }))
    );

  const initialValues: CrmTaskEntity = useMemo(
    () => ({
      name: selectedTask?.name ?? "",
      typeId: selectedTask?.typeId,
      dueAt: selectedTask?.dueAt,
      priority: selectedTask?.priority ?? CrmPriorityEnum.MEDIUM,
      contactId: selectedTask?.contactId,
      dealId: selectedTask?.dealId,
      ownerId: selectedTask?.ownerId,
      notes: selectedTask?.notes ?? ""
    }),
    [selectedTask]
  );

  const submitEditTask = (formValues: CrmTaskEntity) => {
    if (!selectedTaskId) return;

    const changedFields = getChangedTaskFields(formValues, initialValues);
    if (Object.keys(changedFields).length === 0) {
      setIsTaskModalOpen(false);
      return;
    }

    editTask({ id: selectedTaskId, ...changedFields });
  };

  const formik = useFormik({
    initialValues,
    onSubmit: submitEditTask,
    validationSchema: taskValidations(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleSuccess = (updatedTask: CrmTaskEntity) => {
    setSubmitting(false);
    setIsTaskModalOpen(false);

    setTasks(mergeTasks(tasks, [updatedTask]));

    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"])
    });
  };

  const handleError = () => {
    setSubmitting(false);

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText(["toastMessages", "errorDescription"])
    });
  };

  const { mutate: editTask, isPending } = useUpdateTask(
    handleSuccess,
    handleError
  );

  return (
    <TaskModalForm
      formik={formik}
      isPending={isPending}
      translateText={translateText}
    />
  );
};

export default EditTaskModalContent;
