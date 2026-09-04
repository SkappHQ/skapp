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
  updateTaskRecord
} from "~community/crm/v2/utils/taskUtil";
import { getTaskValidationSchema } from "~community/crm/v2/utils/taskValidations";

interface Props {
  taskId: number;
}

const EditTaskModalContent: FC<Props> = ({ taskId }) => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "editTaskModal");

  const { tasks, setTasks, setIsTaskModalOpen } = useCrmStoreV2(
    useShallow((store) => ({
      tasks: store.tasks,
      setTasks: store.setTasks,
      setIsTaskModalOpen: store.setIsTaskModalOpen
    }))
  );

  const selectedTask = tasks[taskId];

  const initialValues: CrmTaskEntity = useMemo(
    () => ({
      name: selectedTask?.name ?? "",
      typeId: selectedTask?.typeId,
      priority: selectedTask?.priority ?? CrmPriorityEnum.MEDIUM,
      dueAt: selectedTask?.dueAt,
      ownerId: selectedTask?.ownerId,
      contactId: selectedTask?.contactId,
      dealId: selectedTask?.dealId,
      notes: selectedTask?.notes ?? ""
    }),
    [selectedTask]
  );

  const formik = useFormik<CrmTaskEntity>({
    initialValues,
    onSubmit: (values) => submitEditTask(values),
    validationSchema: getTaskValidationSchema(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleCloseModal = (): void => {
    setIsTaskModalOpen(false);
  };

  const handleSuccess = (updatedTask: CrmTaskEntity) => {
    setSubmitting(false);
    setTasks(updateTaskRecord(tasks, [updatedTask]));

    handleCloseModal();
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

  const submitEditTask = (values: CrmTaskEntity) => {
    const changedFields = getChangedTaskFields(initialValues, {
      ...values,
      name: values.name?.trim(),
      notes: values.notes?.trim()
    });

    if (Object.keys(changedFields).length === 0) {
      setSubmitting(false);
      handleCloseModal();
      return;
    }

    editTask({ id: taskId, task: changedFields });
  };

  return (
    <TaskModalForm
      formik={formik}
      isPending={isPending}
      translateText={translateText}
      onCancel={handleCloseModal}
    />
  );
};

export default EditTaskModalContent;
