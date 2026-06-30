import { useFormik } from "formik";
import { FC, useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateTask } from "~community/crm/api/TaskApi";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmOwner,
  CrmTaskCreatePayload,
  CrmTaskFormTypes
} from "~community/crm/types/CommonTypes";
import { addTaskValidations } from "~community/crm/utils/taskValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

import TaskModalForm from "../TaskModalForm/TaskModalForm";

const AddTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const { setIsTaskModalOpen, preselectedContact, selectedCompany } =
    useCrmStore((store) => ({
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      preselectedContact: store.preselectedContact,
      selectedCompany: store.selectedCompany
    }));

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
      contactId: preselectedContact?.id ?? null,
      dealId: null,
      owner: defaultOwner?.employeeId ? Number(defaultOwner.employeeId) : null,
      notes: ""
    }),
    [defaultOwner, preselectedContact?.id]
  );

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => createTask(values),
    validationSchema: addTaskValidations(translateText),
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
      title: translateText(["successTitle"])
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
    handleError,
    preselectedContact?.id,
    selectedCompany?.id
  );

  const createTask = (formValues: CrmTaskFormTypes) => {
    const payload: CrmTaskCreatePayload = {
      name: formValues.name.trim(),
      typeId: formValues.type?.id ?? undefined,
      dueAt: formValues.dueDate ?? null,
      priority: formValues.priority,
      contactId: formValues.contactId ?? undefined,
      dealId: formValues.dealId ?? undefined,
      ownerId: formValues.owner ?? undefined,
      notes: formValues.notes?.trim()
    };

    createNewTask(payload);
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
