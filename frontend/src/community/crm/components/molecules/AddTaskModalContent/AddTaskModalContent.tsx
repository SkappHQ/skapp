import { useFormik } from "formik";
import { FC, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateTask } from "~community/crm/api/TaskApi";
import TaskModalForm from "~community/crm/components/molecules/TaskModalForm/TaskModalForm";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { useCurrentUserAsCrmOwner } from "~community/crm/hooks/useCurrentUserAsCrmOwner";
import { useCrmStore } from "~community/crm/store/store";
import { CrmTaskEntity } from "~community/crm/types/CrmCommonTypes";
import { getSelectedContact } from "~community/crm/utils/contactUtil";
import { getSelectedDeal } from "~community/crm/utils/dealUtil";
import {
  linkTaskToRelatedEntities,
  updateTaskRecord
} from "~community/crm/utils/taskUtil";
import { getTaskValidationSchema } from "~community/crm/utils/taskValidations";

const AddTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule");

  const {
    tasks,
    taskIds,
    companies,
    contacts,
    deals,
    selectedContactId,
    selectedDealId,
    setTasks,
    setTaskIds,
    setCompanies,
    setContacts,
    setDeals,
    setIsTaskModalOpen
  } = useCrmStore(
    useShallow((store) => ({
      tasks: store.tasks,
      taskIds: store.taskIds,
      companies: store.companies,
      contacts: store.contacts,
      deals: store.deals,
      selectedContactId: store.selectedContactId,
      selectedDealId: store.selectedDealId,
      setTasks: store.setTasks,
      setTaskIds: store.setTaskIds,
      setCompanies: store.setCompanies,
      setContacts: store.setContacts,
      setDeals: store.setDeals,
      setIsTaskModalOpen: store.setIsTaskModalOpen
    }))
  );

  const defaultOwner = useCurrentUserAsCrmOwner();

  const selectedContact = getSelectedContact(contacts, selectedContactId);
  const selectedDeal = getSelectedDeal(deals, selectedDealId);

  const initialValues: CrmTaskEntity = useMemo(
    () => ({
      name: "",
      typeId: undefined,
      priority: CrmPriorityEnum.MEDIUM,
      dueAt: undefined,
      ownerId: defaultOwner?.employeeId,
      contactId: selectedContact?.id,
      dealId: selectedDeal?.id,
      notes: ""
    }),
    [defaultOwner, selectedContact?.id, selectedDeal?.id]
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
