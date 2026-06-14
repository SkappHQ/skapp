import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateTask } from "~community/crm/api/TaskApi";
import TaskFormContent from "~community/crm/components/templates/TaskFormTemplate/TaskFormTemplate";
import useTaskFormLogic from "~community/crm/hooks/useTaskFormLogic";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmTaskAddFormTypes,
  CrmTaskCreatePayload
} from "~community/crm/types/CommonTypes";

const AddTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const { setIsTaskModalOpen } = useCrmStore((store) => ({
    setIsTaskModalOpen: store.setIsTaskModalOpen
  }));

  const handleCloseModal = (): void => {
    setIsTaskModalOpen(false);
    formLogic.resetForm();
    formLogic.resetSearchState();
  };

  const handleSuccess = () => {
    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["successTitle"])
    });
  };

  const handleError = () => {
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

  const createTask = (formValues: CrmTaskAddFormTypes) => {
    const payload: CrmTaskCreatePayload = {
      name: formValues.name.trim(),
      typeId: formValues.type?.id ?? undefined,
      dueAt: formValues.dueDate,
      priority: formValues.priority,
      contactId: formValues.contactId ?? undefined,
      dealId: formValues.dealId ?? undefined,
      ownerId: formValues.owner ?? undefined,
      notes: formValues.notes?.trim()
    };

    createNewTask(payload);
  };

  const formLogic = useTaskFormLogic({ onSubmit: createTask });

  return (
    <TaskFormContent
      values={formLogic.values}
      errors={formLogic.errors}
      handleChange={formLogic.handleChange}
      setFieldValue={formLogic.setFieldValue}
      isSubmitting={formLogic.isSubmitting}
      isPending={isPending}
      selectedOwner={formLogic.selectedOwner}
      ownerSearchText={formLogic.ownerSearchText}
      ownerLookupItems={formLogic.ownerLookupItems}
      onOwnerSelect={formLogic.handleOwnerSelect}
      onOwnerSearchChange={formLogic.handleOwnerSearchChange}
      onOwnerRemove={formLogic.handleOwnerRemove}
      isOwnerFetching={formLogic.isOwnerFetching}
      isCrmSalesManager={formLogic.isCrmSalesManager}
      selectedContactLabel={formLogic.selectedContactLabel}
      contactSearchText={formLogic.contactSearchText}
      contactDropdownItems={formLogic.contactDropdownItems}
      onContactSelect={formLogic.handleContactSelect}
      onContactSearchChange={formLogic.handleContactSearchChange}
      onClearContact={formLogic.handleClearContact}
      isContactFetching={formLogic.isContactFetching}
      selectedDealLabel={formLogic.selectedDealLabel}
      dealSearchText={formLogic.dealSearchText}
      dealDropdownItems={formLogic.dealDropdownItems}
      onDealSelect={formLogic.handleDealSelect}
      onDealSearchChange={formLogic.handleDealSearchChange}
      onClearDeal={formLogic.handleClearDeal}
      isDealFetching={formLogic.isDealFetching}
      priorityOptions={formLogic.priorityOptions}
      taskTypeOptions={formLogic.taskTypeOptions}
      onSubmit={formLogic.submitForm}
      onCancel={handleCloseModal}
      translateText={formLogic.translateText}
    />
  );
};

export default AddTaskModalContent;
