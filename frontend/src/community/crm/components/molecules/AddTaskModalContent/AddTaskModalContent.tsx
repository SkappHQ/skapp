import {
  ButtonV2,
  CalendarIcon,
  CloseIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { useMemo, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateTask } from "~community/crm/api/TaskApi";
import SelectedOwnerField from "~community/crm/components/molecules/SelectedOwnerField/SelectedOwnerField";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import useGetPriorityOptions from "~community/crm/hooks/useGetPriorityOptions";
import useGetTaskTypeOptions from "~community/crm/hooks/useGetTaskTypeOptions";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmOwner,
  CrmTaskAddFormTypes,
  CrmTaskCreatePayload
} from "~community/crm/types/CommonTypes";
import { addTaskValidations } from "~community/crm/utils/taskValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

const AddTaskModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const { setIsTaskModalOpen } = useCrmStore((store) => ({
    setIsTaskModalOpen: store.setIsTaskModalOpen
  }));

  const { data: currentUser } = useGetUserPersonalDetails();

  const { isCrmSalesManager } = useSessionData();

  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(null);

  const [ownerSearchText, setOwnerSearchText] = useState("");

  const priorityDropdownOptions = useGetPriorityOptions();
  const { options: taskTypeOptions, getCategoryById } = useGetTaskTypeOptions();

  const defaultOwner = useMemo(() => {
    if (!currentUser?.employeeId) return null;
    return {
      employeeId: currentUser.employeeId,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      authPic: currentUser.authPic as string | null
    };
  }, [currentUser]);

  const initialValues: CrmTaskAddFormTypes = {
    name: "",
    type: null,
    dueDate: null,
    priority: CrmPriorityEnum.MEDIUM,
    contactName: "",
    deal: "",
    owner: defaultOwner?.employeeId ? Number(defaultOwner.employeeId) : null,
    notes: ""
  };

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => createTask(values),
    validationSchema: addTaskValidations(translateText),
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true
  });

  const {
    values,
    errors,
    handleChange,
    isSubmitting,
    setFieldValue,
    setSubmitting,
    submitForm,
    resetForm
  } = formik;

  const handleCloseModal = (): void => {
    setIsTaskModalOpen(false);
    resetForm();
    setOwnerSearchText("");
  };

  const handleSuccess = () => {
    setSubmitting(false);
    handleCloseModal();
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

  const handleOwnerSelect = (owner: SearchableDropdownItem) => {
    setFieldValue("owner", Number(owner.id));
    setOwnerSearchText("");
    // TODO: Lookup owner from owner.id and construct CrmOwner to set
    setSelectedOwner(null);
  };

  const { mutate: createNewTask, isPending } = useCreateTask(
    handleSuccess,
    handleError
  );

  const createTask = (formValues: CrmTaskAddFormTypes) => {
    const payload: CrmTaskCreatePayload = {
      name: formValues.name.trim(),
      type: formValues.type,
      dueAt: formValues.dueDate,
      priority: formValues.priority,
      contactName: formValues.contactName?.trim(),
      deal: formValues.deal?.trim(),
      owner: formValues.owner,
      notes: formValues.notes?.trim()
    };

    createNewTask(payload);
  };

  return (
    <div className="flex flex-col w-full h-full justify-between gap-[0.625rem]">
      <Dropdown
        label={translateText(["labels", "type"])}
        placeholder={translateText(["placeholders", "type"])}
        options={taskTypeOptions}
        value={values.type?.id?.toString() ?? undefined}
        onChange={(value) =>
          setFieldValue("type", getCategoryById(Number(value)) ?? null)
        }
        errorMessage={errors.type}
        variant={errors.type ? "primary-error" : "primary"}
        width="100%"
        className="rounded-lg"
        ariaLabel={translateText(["ariaLabels", "type"])}
        required
      />

      <InputField
        name="name"
        value={values.name}
        errorMessage={errors.name}
        state={errors.name ? "error" : "default"}
        label={translateText(["labels", "task"])}
        placeholder={translateText(["placeholders", "task"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "task"])}
        fullWidth
        required
      />

      <DatePicker
        mode="single"
        selected={values.dueDate ? new Date(values.dueDate) : undefined}
        onSelect={(date: Date | undefined) =>
          setFieldValue("dueDate", date ? date.toISOString() : null)
        }
        popperProps={{ position: "bottom-end" }}
      >
        <div>
          <InputField
            name="dueDate"
            value={
              values.dueDate
                ? new Date(values.dueDate).toLocaleDateString()
                : ""
            }
            label={translateText(["labels", "dueDate"])}
            placeholder={translateText(["placeholders", "dueDate"])}
            state={errors.dueDate ? "error" : "default"}
            errorMessage={errors.dueDate || ""}
            aria-label={translateText(["ariaLabels", "dueDate"])}
            rightIcon={<CalendarIcon />}
            fullWidth
            readOnly
            required
          />
        </div>
      </DatePicker>

      <Dropdown
        label={translateText(["labels", "priority"])}
        placeholder={translateText(["placeholders", "priority"])}
        options={priorityDropdownOptions}
        value={values.priority ?? undefined}
        onChange={(value) => setFieldValue("priority", value)}
        errorMessage={errors.priority || ""}
        width="100%"
        className="rounded-lg"
        ariaLabel={translateText(["ariaLabels", "priority"])}
      />

      <SearchableDropdown
        id="contact-search"
        label={translateText(["labels", "contactName"])}
        placeholder={translateText(["placeholders", "contactName"])}
        value={values.contactName ?? ""}
        onChange={(e) => setFieldValue("contactName", e.target.value)}
        items={[]}
        onSelect={(item) => setFieldValue("contactName", item.id)}
      />

      <SearchableDropdown
        id="deal-search"
        label={translateText(["labels", "deal"])}
        placeholder={translateText(["placeholders", "deal"])}
        value={values.deal ?? ""}
        onChange={(e) => setFieldValue("deal", e.target.value)}
        items={[]}
        onSelect={(item) => setFieldValue("deal", item.id)}
      />

      {selectedOwner ? (
        <SelectedOwnerField
          label={translateText(["labels", "taskOwner"])}
          owner={selectedOwner}
          onRemove={() => {
            setSelectedOwner(null);
            setFieldValue("owner", null);
          }}
          showRemoveButton={isCrmSalesManager ?? false}
          ariaLabel={translateText(["ariaLabels", "removeOwner"])}
        />
      ) : (
        <SearchableDropdown
          id="owner-search"
          items={[]}
          onSelect={handleOwnerSelect}
          label={translateText(["labels", "taskOwner"])}
          placeholder={translateText(["placeholders", "taskOwner"])}
          value={ownerSearchText}
          onChange={(e) => setOwnerSearchText(e.target.value)}
        />
      )}

      <TextArea
        name="notes"
        value={values.notes}
        placeholder={translateText(["placeholders", "notes"])}
        label={translateText(["labels", "notes"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "notes"])}
      />

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isSubmitting}
          onClick={handleCloseModal}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["ariaLabels", "cancel"])}
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={submitForm}
          disabled={isSubmitting || isPending}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default AddTaskModalContent;
