import { useFormik } from "formik";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateTask } from "~community/crm/v2/api/TaskApi";
import TaskModalForm from "~community/crm/v2/components/molecules/TaskModalForm/TaskModalForm";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmOwnerEntity,
  CrmTaskEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import { updateOwnerRecord } from "~community/crm/v2/utils/commonUtil";
import {
  linkTaskToRelatedEntities,
  updateTaskRecord
} from "~community/crm/v2/utils/taskUtil";
import { getTaskValidationSchema } from "~community/crm/v2/utils/taskValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

const AddTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

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
  } = useCrmStoreV2(
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

  const initialValues: CrmTaskEntity = useMemo(() => {
    const values: CrmTaskEntity = {
      name: "",
      priority: CrmPriorityEnum.MEDIUM,
      ownerId: defaultOwner?.employeeId,
      notes: ""
    };

    if (selectedContactId !== null) {
      values.contactId = selectedContactId;
    }

    return values;
  }, [defaultOwner, selectedContactId]);

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

      const linked = linkTaskToRelatedEntities(
        createdTask,
        companies,
        contacts,
        deals
      );

      setCompanies({ ...companies, ...linked.companies });
      setContacts({ ...contacts, ...linked.contacts });
      setDeals({ ...deals, ...linked.deals });
    }

    handleCloseModal();
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
