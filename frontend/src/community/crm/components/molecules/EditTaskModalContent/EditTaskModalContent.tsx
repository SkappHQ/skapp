import { useFormik } from "formik";
import { FC, useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTask } from "~community/crm/api/TaskApi";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import useGetTaskTypeOptions from "~community/crm/hooks/useGetTaskTypeOptions";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmTaskFormTypes,
  CrmTaskUpdatePayload
} from "~community/crm/types/CommonTypes";
import { getChangedTaskFields } from "~community/crm/utils/taskUtil";
import { editTaskValidations } from "~community/crm/utils/taskValidations";

import TaskModalForm from "../TaskModalForm/TaskModalForm";

const EditTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "editTaskModal");

  const { setIsTaskModalOpen, selectedTask } = useCrmStore((store) => ({
    setIsTaskModalOpen: store.setIsTaskModalOpen,
    selectedTask: store.selectedTask
  }));

  const { getCategoryById } = useGetTaskTypeOptions();

  const submitEditTask = (formValues: CrmTaskFormTypes) => {
    if (!selectedTask) return;

    const changedFields = getChangedTaskFields(formValues, initialValues);

    const payload: CrmTaskUpdatePayload = {
      id: selectedTask.id,
      ...changedFields
    };

    editTask(payload);
  };

  const initialValues: CrmTaskFormTypes = useMemo(
    () => ({
      name: selectedTask?.name ?? "",
      type: selectedTask?.typeId
        ? (getCategoryById(selectedTask.typeId) ?? null)
        : null,
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
    validationSchema: editTaskValidations(translateText),
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
      title: translateText(["toastMessages", "successTitle"])
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
