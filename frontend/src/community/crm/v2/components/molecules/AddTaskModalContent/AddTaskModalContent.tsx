import { useFormik } from "formik";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateTask } from "~community/crm/v2/api/TaskApi";
import TaskModalForm from "~community/crm/v2/components/molecules/TaskModalForm/TaskModalForm";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  getTaskFormInitialValues,
  getTrimmedTaskValues,
  linkTaskToRelatedEntities
} from "~community/crm/v2/utils/taskUtil";
import { getTaskValidationSchema } from "~community/crm/v2/utils/taskValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

const AddTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const {
    tasks,
    companies,
    contacts,
    deals,
    selectedContactId,
    setTasks,
    setCompanies,
    setContacts,
    setDeals,
    setIsTaskModalOpen
  } = useCrmStoreV2(
    useShallow((store) => ({
      tasks: store.tasks,
      companies: store.companies,
      contacts: store.contacts,
      deals: store.deals,
      selectedContactId: store.selectedContactId,
      setTasks: store.setTasks,
      setCompanies: store.setCompanies,
      setContacts: store.setContacts,
      setDeals: store.setDeals,
      setIsTaskModalOpen: store.setIsTaskModalOpen
    }))
  );

  const { data: currentUser } = useGetUserPersonalDetails();

  const formik = useFormik<CrmTaskEntity>({
    initialValues: getTaskFormInitialValues(
      selectedContactId,
      currentUser?.employeeId
    ),
    onSubmit: (values) => createNewTask(getTrimmedTaskValues(values)),
    validationSchema: getTaskValidationSchema(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleSuccess = (createdTask: CrmTaskEntity) => {
    if (createdTask.id !== undefined) {
      setTasks({ ...tasks, [createdTask.id]: createdTask });
    }

    const linked = linkTaskToRelatedEntities(createdTask, {
      companies,
      contacts,
      deals
    });
    setCompanies(linked.companies);
    setContacts(linked.contacts);
    setDeals(linked.deals);

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

  return (
    <TaskModalForm
      formik={formik}
      isPending={isPending}
      translateText={translateText}
    />
  );
};

export default AddTaskModalContent;
