import { useFormik } from "formik";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateTask } from "~community/crm/api/TaskApi";
import TaskModalForm from "~community/crm/components/molecules/TaskModalForm/TaskModalForm";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmOwnerEntity,
  CrmTaskEntity
} from "~community/crm/types/CrmCommonTypes";
import { updateOwnerRecord } from "~community/crm/utils/commonUtil";
import { getSelectedContact } from "~community/crm/utils/contactUtil";
import {
  linkTaskToRelatedEntities,
  updateTaskRecord
} from "~community/crm/utils/taskUtil";
import { getTaskValidationSchema } from "~community/crm/utils/taskValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

const AddTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule");

  const {
    tasks,
    taskIds,
    owners,
    companies,
    contacts,
    deals,
    selectedContactId,
    setTasks,
    setTaskIds,
    setOwners,
    setCompanies,
    setContacts,
    setDeals,
    setIsTaskModalOpen
  } = useCrmStore(
    useShallow((store) => ({
      tasks: store.tasks,
      taskIds: store.taskIds,
      owners: store.owners,
      companies: store.companies,
      contacts: store.contacts,
      deals: store.deals,
      selectedContactId: store.selectedContactId,
      setTasks: store.setTasks,
      setTaskIds: store.setTaskIds,
      setOwners: store.setOwners,
      setCompanies: store.setCompanies,
      setContacts: store.setContacts,
      setDeals: store.setDeals,
      setIsTaskModalOpen: store.setIsTaskModalOpen
    }))
  );

  const { data: currentUser } = useGetUserPersonalDetails();

  const defaultOwner = useMemo((): CrmOwnerEntity | null => {
    if (!currentUser?.employeeId) return null;

    return {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? "",
      authPic: currentUser.authPic as string | null
    };
  }, [
    currentUser?.employeeId,
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.authPic
  ]);

  useEffect(() => {
    if (!defaultOwner) return;

    setOwners(updateOwnerRecord(owners, [defaultOwner]));
  }, [defaultOwner]);

  const selectedContact = getSelectedContact(contacts, selectedContactId);

  const initialValues: CrmTaskEntity = useMemo(
    () => ({
      name: "",
      typeId: undefined,
      priority: CrmPriorityEnum.MEDIUM,
      dueAt: undefined,
      ownerId: defaultOwner?.employeeId,
      contactId: selectedContact?.id,
      notes: ""
    }),
    [defaultOwner, selectedContact?.id]
  );

  const formik = useFormik<CrmTaskEntity>({
    initialValues,
    onSubmit: (values) => createTask(values),
    validationSchema: getTaskValidationSchema(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleCloseModal = (): void => {
    setIsTaskModalOpen(false);
  };

  const handleSuccess = (createdTask: CrmTaskEntity) => {
    setSubmitting(false);

    if (createdTask.id !== undefined) {
      setTasks(updateTaskRecord(tasks, [createdTask]));
      setTaskIds([createdTask.id, ...taskIds]);

      const links = linkTaskToRelatedEntities(
        createdTask,
        companies,
        contacts,
        deals
      );

      setCompanies(links.companies);
      setContacts(links.contacts);
      setDeals(links.deals);
    }

    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "tasks",
        "modal",
        "toastMessages",
        "addSuccessTitle"
      ]),
      description: translateText([
        "tasks",
        "modal",
        "toastMessages",
        "addSuccessDescription"
      ])
    });
  };

  const handleError = () => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "tasks",
        "modal",
        "toastMessages",
        "addErrorTitle"
      ]),
      description: translateText([
        "tasks",
        "modal",
        "toastMessages",
        "addErrorDescription"
      ])
    });
  };

  const { mutate: createNewTask, isPending } = useCreateTask(
    handleSuccess,
    handleError
  );

  const createTask = (values: CrmTaskEntity) => {
    const payload: CrmTaskEntity = {
      name: values.name?.trim(),
      typeId: values.typeId,
      priority: values.priority,
      dueAt: values.dueAt,
      ownerId: values.ownerId,
      companyId: values.companyId,
      contactId: values.contactId,
      dealId: values.dealId,
      notes: values.notes?.trim()
    };

    createNewTask(payload);
  };

  return (
    <TaskModalForm
      formik={formik}
      isPending={isPending}
      onCancel={handleCloseModal}
    />
  );
};

export default AddTaskModalContent;
