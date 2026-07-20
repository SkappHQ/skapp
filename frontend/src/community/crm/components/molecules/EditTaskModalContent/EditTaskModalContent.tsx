import { useFormik } from "formik";
import { FC, useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTask } from "~community/crm/api/TaskApi";
import TaskModalForm from "~community/crm/components/molecules/TaskModalForm/TaskModalForm";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import useGetTaskTypeOptions from "~community/crm/hooks/useGetTaskTypeOptions";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmTaskFormTypes,
  CrmTaskUpdatePayload
} from "~community/crm/types/CommonTypes";
import { getChangedTaskFields } from "~community/crm/utils/taskUtil";
import { taskValidations } from "~community/crm/utils/taskValidations";

const EditTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "editTaskModal");

  const { setIsTaskModalOpen, selectedTaskId, getTaskById } = useCrmStore(
    (store) => ({
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      selectedTaskId: store.selectedTaskId,
      getTaskById: store.getTaskById
    })
  );

  const { getCategoryById } = useGetTaskTypeOptions(translateText);

  const submitEditTask = (formValues: CrmTaskFormTypes) => {
    if (!selectedTaskId) return;

    const changedFields = getChangedTaskFields(formValues, initialValues);
    if (Object.keys(changedFields).length === 0) {
      setIsTaskModalOpen(false);
      return;
    }

    const payload: CrmTaskUpdatePayload = {
      id: selectedTaskId,
      ...changedFields
    };

    editTask(payload);
  };

  const selectedTask = getTaskById(selectedTaskId!);

  const initialValues: CrmTaskFormTypes = useMemo(
    () => ({
      name: selectedTask?.name ?? "",
      type: selectedTask?.typeId ? getCategoryById(selectedTask.typeId) : null,
      dueDate: selectedTask?.dueAt ?? null,
      priority: selectedTask?.priority ?? CrmPriorityEnum.MEDIUM,
      contactId: selectedTask?.contact?.id ?? null,
      dealId: selectedTask?.deal?.id ?? null,
      owner: selectedTask?.owner?.employeeId ?? null,
      notes: selectedTask?.notes ?? ""
    }),
    [selectedTask, getCategoryById]
  );

  const formik = useFormik({
    initialValues,
    onSubmit: submitEditTask,
    validationSchema: taskValidations(translateText),
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleSuccess = () => {
    setSubmitting(false);
    setIsTaskModalOpen(false);

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
