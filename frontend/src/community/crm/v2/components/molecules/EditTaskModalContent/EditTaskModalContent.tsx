import { useFormik } from "formik";
import { FC, useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTask } from "~community/crm/v2/api/TaskApi";
import TaskModalForm from "~community/crm/v2/components/molecules/TaskModalForm/TaskModalForm";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  mergeTasksRecord,
  toTasksRecord
} from "~community/crm/v2/utils/crmEntityUtils";
import { getChangedTaskFields } from "~community/crm/v2/utils/crmTaskUtils";
import { taskValidations } from "~community/crm/v2/utils/taskValidations";

const EditTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "editTaskModal");

  const { setIsTaskModalOpen, selectedTaskId, tasks, setTasks } = useCrmStoreV2(
    (state) => ({
      setIsTaskModalOpen: state.setIsTaskModalOpen,
      selectedTaskId: state.selectedTaskId,
      tasks: state.tasks,
      setTasks: state.setTasks
    })
  );

  const selectedTask = selectedTaskId ? tasks[selectedTaskId] : undefined;

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
    validateOnBlur: false,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleSuccess = (updatedTask: CrmTaskEntity) => {
    setSubmitting(false);
    setIsTaskModalOpen(false);

    setTasks(mergeTasksRecord(tasks, toTasksRecord([updatedTask])));

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
