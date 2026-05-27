import {
  AvatarChip,
  AvatarChipsInput,
  AvatarChipsInputResult,
  ButtonV2,
  CalendarIcon,
  CloseIcon,
  DatePicker,
  Dropdown,
  InputField,
  SearchInputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateTask } from "~community/crm/api/TaskApi";
import { getPriorityOptions } from "~community/crm/components/atoms/TaskOptions/TaskOptions";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmTaskAddFormTypes,
  CrmTaskCreatePayload
} from "~community/crm/types/CommonTypes";
import { addTaskValidations } from "~community/crm/utils/taskValidations";

const AddTaskModal: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const { setIsAddTaskModalOpen } = useCrmStore();

  const { isCrmSalesManager } = useSessionData();

  const [selectedOwnerChips, setSelectedOwnerChips] = useState<
    AvatarChipsInputResult[]
  >([]);

  const [ownerSearchText, setOwnerSearchText] = useState("");

  const priorityOptions = getPriorityOptions(translateText);

  // TODO: Replace with API data when backend integrated
  interface TaskTypeOption {
    id: string;
    label: string;
    value: string;
  }

  const taskTypeOptions: TaskTypeOption[] = ["call", "email", "meeting", "other"].map(
    (type) => ({
      id: type,
      label: type,
      value: type.toUpperCase()
    })
  );

  // TODO: Replace with API data when backend integrated
  const ownerOptions: AvatarChipsInputResult[] = [
    {
      optionId: 1,
      chipContent: {
        label: "Jane Doe",
        avatarProps: {
          id: "owner-avatar",
          firstName: "Jane",
          lastName: "Doe",
          size: "sm"
        }
      },
      type: "user"
    }
  ];

  const handleOwnerChipSelect = (chip: AvatarChipsInputResult) => {
    setSelectedOwnerChips([chip]);
    setFieldValue("owner", chip.optionId);
    setOwnerSearchText("");
  };

  const handleOwnerChipRemove = (_chip: AvatarChipsInputResult) => {
    setSelectedOwnerChips([]);
    setFieldValue("owner", null);
  };

  const handleOwnerSearchTextChange = (text: string) => {
    setOwnerSearchText(text);
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

  const handleCloseModal = (): void => {
    setIsAddTaskModalOpen(false);
  };

  const { mutate: createNewTask } = useCreateTask(handleSuccess, handleError);

  const createTask = (values: CrmTaskAddFormTypes) => {
    const payload: CrmTaskCreatePayload = {
      name: values.name.trim(),
      type: values.type,
      dueAt: values.dueDate,
      priority: values.priority,
      contactName: values.contactName?.trim() || null,
      deal: values.deal?.trim() || null,
      owner: values.owner,
      notes: values.notes?.trim() || null
    };

    createNewTask(payload);
  };

  const initialValues: CrmTaskAddFormTypes = {
    name: "",
    type: null,
    dueDate: null,
    priority: priorityOptions[1].value,
    contactName: "",
    deal: "",
    owner: null,
    notes: ""
  };

  const formik = useFormik({
    initialValues,
    onSubmit: createTask,
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
    submitForm
  } = formik;

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <Dropdown
        label={translateText(["labels", "type"])}
        placeholder={translateText(["placeholders", "type"])}
        options={taskTypeOptions}
        value={values.type ?? undefined}
        onChange={(value) => setFieldValue("type", value)}
        errorMessage={errors.type}
        variant={errors.type ? "primary-error" : "primary"}
        width="100%"
        className="rounded-[0.5rem] w-full"
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
          setFieldValue("dueDate", date?.toISOString() ?? null)
        }
        popoverPosition="bottom-right"
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
            onChange={() => {}}
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
        options={priorityOptions}
        value={values.priority ?? undefined}
        onChange={(value) => setFieldValue("priority", value)}
        errorMessage={errors.priority || ""}
        width="100%"
        className="rounded-[0.5rem]"
      />

      <label className="subtitle1">
        {translateText(["labels", "contactName"])}
      </label>
      <SearchInputField
        inputId="contact"
        searchText={values.contactName}
        onSearchTextChange={(val) => setFieldValue("contactName", val)}
        filteredResults={["John Doe", "Jane Smith"]}
        onItemSelect={(item) => setFieldValue("contactName", item || "")}
        selectedItemText={values.contactName}
        renderItem={(item: string) => item}
        placeholder={translateText(["placeholders", "contactName"])}
      />

      <label className="subtitle1">{translateText(["labels", "deal"])}</label>
      <SearchInputField
        inputId="deal"
        searchText={values.deal}
        onSearchTextChange={(val) => setFieldValue("deal", val)}
        filteredResults={["deal1", "deal2"]}
        onItemSelect={(item) => setFieldValue("deal", item || "")}
        selectedItemText={values.deal}
        renderItem={(item: string) => item}
        placeholder={translateText(["placeholders", "deal"])}
      />

      <label className="subtitle1">
        {translateText(["labels", "taskOwner"])}
      </label>
      {/* TODO: Placeholder for SearchableDropdown. Will be implemented with backend. */}
      {isCrmSalesManager ? (
        <AvatarChipsInput
          filteredResults={ownerOptions}
          selectedChips={selectedOwnerChips}
          searchText={ownerSearchText}
          onChipSelect={handleOwnerChipSelect}
          onChipRemove={handleOwnerChipRemove}
          onSearchTextChange={handleOwnerSearchTextChange}
          searchPlaceholder={translateText(["placeholders", "taskOwner"])}
        />
      ) : (
        <div className="h-12 rounded-lg bg-tertiary-background flex items-center px-3"> 
          <AvatarChip
            label="John Doe"
            avatarProps={{
              id: "owner-avatar",
              firstName: "John",
              lastName: "Doe",
              size: "sm"
            }}
          />
        </div>
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
          onClick={() => submitForm()}
          disabled={isSubmitting}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default AddTaskModal;
