import { useFormik } from "formik";
import { FC, useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { CrmOwner, CrmTaskFormTypes } from "~community/crm/types/CommonTypes";
import { taskValidations } from "~community/crm/utils/taskValidations";
import { useCreateTask } from "~community/crm/v2/api/TaskApi";
import TaskModalForm from "~community/crm/v2/components/molecules/TaskModalForm/TaskModalForm";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

const AddTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const setIsTaskModalOpen = useCrmStoreV2((state) => state.setIsTaskModalOpen);
  const selectedContactId = useCrmStoreV2((state) => state.selectedContactId);

  const { data: currentUser } = useGetUserPersonalDetails();

  const defaultOwner = useMemo((): CrmOwner | null => {
    if (!currentUser?.employeeId) return null;
    return {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? "",
      authPic: currentUser.authPic as string | null
    };
  }, [currentUser]);

  const initialValues: CrmTaskFormTypes = useMemo(
    () => ({
      name: "",
      type: null,
      dueDate: null,
      priority: CrmPriorityEnum.MEDIUM,
      contactId: selectedContactId ?? null,
      dealId: null,
      owner: defaultOwner?.employeeId ? Number(defaultOwner.employeeId) : null,
      notes: ""
    }),
    [defaultOwner, selectedContactId]
  );

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => createTask(values),
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
      title: translateText(["successTitle"]),
      description: translateText(["successDescription"])
    });
  };

  const handleError = () => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["errorTitle"]),
      description: translateText(["errorDescription"])
    });
  };

  const { mutate: createNewTask, isPending } = useCreateTask(
    handleSuccess,
    handleError
  );

  const createTask = (formValues: CrmTaskFormTypes) => {
    const task: CrmTaskEntity = {
      name: formValues.name.trim(),
      typeId: formValues.type?.id ?? undefined,
      dueAt: formValues.dueDate ?? undefined,
      priority: formValues.priority,
      contactId: formValues.contactId ?? undefined,
      dealId: formValues.dealId ?? undefined,
      ownerId: formValues.owner ?? undefined,
      notes: formValues.notes?.trim()
    };

    createNewTask(task);
  };

  return (
    <TaskModalForm
      formik={formik}
      isPending={isPending}
      translateText={translateText}
      initialOwner={defaultOwner}
    />
  );
};

export default AddTaskModalContent;
