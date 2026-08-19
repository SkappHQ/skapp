import { useFormik } from "formik";
import { FC, useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { CrmTaskFormTypes } from "~community/crm/types/CommonTypes";
import { taskValidations } from "~community/crm/utils/taskValidations";
import { useUpdateTask } from "~community/crm/v2/api/TaskApi";
import TaskModalForm from "~community/crm/v2/components/molecules/TaskModalForm/TaskModalForm";
import useGetTaskTypeOptions from "~community/crm/v2/hooks/useGetTaskTypeOptions";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  mergeEntityRecord,
  toTasksRecord
} from "~community/crm/v2/utils/crmEntityUtils";
import { getChangedTaskFields } from "~community/crm/v2/utils/crmTaskUtils";

const EditTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "editTaskModal");

  const { setIsTaskModalOpen, selectedTaskId } = useCrmStoreV2((state) => ({
    setIsTaskModalOpen: state.setIsTaskModalOpen,
    selectedTaskId: state.selectedTaskId
  }));
  const selectedTask = useCrmStoreV2((state) =>
    selectedTaskId === null ? undefined : state.tasks[selectedTaskId]
  );

  const { getCategoryById } = useGetTaskTypeOptions(translateText);

  const initialValues: CrmTaskFormTypes = useMemo(
    () => ({
      name: selectedTask?.name ?? "",
      type: selectedTask?.typeId ? getCategoryById(selectedTask.typeId) : null,
      dueDate: selectedTask?.dueAt ?? null,
      priority: selectedTask?.priority ?? CrmPriorityEnum.MEDIUM,
      contactId: selectedTask?.contactId ?? null,
      dealId: selectedTask?.dealId ?? null,
      owner: selectedTask?.ownerId ?? null,
      notes: selectedTask?.notes ?? ""
    }),
    [selectedTask, getCategoryById]
  );

  const submitEditTask = (formValues: CrmTaskFormTypes) => {
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
    validateOnBlur: false,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleSuccess = (updatedTask: CrmTaskEntity) => {
    setSubmitting(false);
    setIsTaskModalOpen(false);

    const { tasks, setTasks } = useCrmStoreV2.getState();
    setTasks(mergeEntityRecord(tasks, toTasksRecord([updatedTask])));

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
