import {
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
import { useMemo, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateTask } from "~community/crm/api/TaskApi";
import { getPriorityOptions } from "~community/crm/components/atoms/PriorityOptions/PriorityOptions";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmTaskAddFormTypes,
  CrmTaskCreatePayload
} from "~community/crm/types/CommonTypes";
import { addTaskValidations } from "~community/crm/utils/taskValidations";

interface TaskTypeOption {
  id: string;
  label: string;
  value: string;
}

const AddTaskModal: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const { setIsAddTaskModalOpen } = useCrmStore((store) => ({
    setIsAddTaskModalOpen: store.setIsAddTaskModalOpen
  }));

  const { employeeDetails } = useSessionData();

  const [selectedOwnerChip, setSelectedOwnerChip] =
    useState<AvatarChipsInputResult | null>(null);

  const [ownerSearchText, setOwnerSearchText] = useState("");

  const priorityOptions = useMemo(
    () => getPriorityOptions(translateText),
    [translateText]
  );

  // TODO: Replace with API data when backend integrated
  const taskTypeOptions: TaskTypeOption[] = useMemo(
    () =>
      (["call", "email", "meeting", "other"] as const).map((type) => ({
        id: type,
        label: translateText(["taskTypes", type]),
        value: type.toUpperCase()
      })),
    [translateText]
  );

  // TODO: Replace with API data when backend integrated
  const ownerOptions: AvatarChipsInputResult[] = useMemo(
    () => [
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
      },
      {
        optionId: 2,
        chipContent: {
          label: "John Smith",
          avatarProps: {
            id: "owner-avatar-2",
            firstName: "John",
            lastName: "Smith",
            size: "sm"
          }
        },
        type: "user"
      }
    ],
    []
  );

  // filtration should be done in backend
  const filteredOwnerOptions = useMemo(
    () =>
      ownerSearchText
        ? ownerOptions.filter((opt) =>
            opt.chipContent.label
              .toLowerCase()
              .includes(ownerSearchText.toLowerCase())
          )
        : ownerOptions,
    [ownerOptions, ownerSearchText]
  );

  const initialValues: CrmTaskAddFormTypes = {
    name: "",
    type: null,
    dueDate: null,
    priority: "MEDIUM",
    contactName: "",
    deal: "",
    owner: employeeDetails?.employeeId || null,
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
    setIsAddTaskModalOpen(false);
    resetForm();
    setSelectedOwnerChip(null);
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
      contactName: formValues.contactName?.trim() || null,
      deal: formValues.deal?.trim() || null,
      owner: formValues.owner,
      notes: formValues.notes?.trim() || null
    };

    createNewTask(payload);
  };

  const handleOwnerChipSelect = (chip: AvatarChipsInputResult) => {
    setSelectedOwnerChip(chip);
    setFieldValue("owner", chip.optionId);
    setOwnerSearchText("");
  };

  const handleOwnerChipRemove = (_chip: AvatarChipsInputResult) => {
    setSelectedOwnerChip(null);
    setFieldValue("owner", null);
  };

  const handleOwnerSearchTextChange = (text: string) => {
    setOwnerSearchText(text);
  };

  return (
    <div className="flex flex-col w-full h-full justify-between gap-[0.625rem]">
      <Dropdown
        label={translateText(["labels", "type"])}
        placeholder={translateText(["placeholders", "type"])}
        options={taskTypeOptions}
        value={values.type ?? undefined}
        onChange={(value) => setFieldValue("type", value)}
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
          setFieldValue("dueDate", date ?? null)
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
        options={priorityOptions}
        value={values.priority ?? undefined}
        onChange={(value) => setFieldValue("priority", value)}
        errorMessage={errors.priority || ""}
        width="100%"
        className="rounded-lg"
        ariaLabel={translateText(["ariaLabels", "priority"])}
      />

      <label htmlFor="contact" className="subtitle1">
        {translateText(["labels", "contactName"])}
      </label>
      {/* TODO: Replace hardcoded filteredResults with API data when backend integrated */}
      <SearchInputField
        inputId="contact"
        searchText={values.contactName}
        onSearchTextChange={(val) => setFieldValue("contactName", val)}
        filteredResults={["John Doe", "Jane Smith"]}
        onItemSelect={(item) => setFieldValue("contactName", item || "")}
        selectedItemText={values.contactName}
        renderItem={(item: string) => item}
        placeholder={translateText(["placeholders", "contactName"])}
        ariaLabelSearch={translateText(["ariaLabels", "contactName"])}
      />

      <label htmlFor="deal" className="subtitle1">
        {translateText(["labels", "deal"])}
      </label>
      {/* TODO: Replace hardcoded filteredResults with API data when backend integrated */}
      <SearchInputField
        inputId="deal"
        searchText={values.deal}
        onSearchTextChange={(val) => setFieldValue("deal", val)}
        filteredResults={["deal1", "deal2"]}
        onItemSelect={(item) => setFieldValue("deal", item || "")}
        selectedItemText={values.deal}
        renderItem={(item: string) => item}
        placeholder={translateText(["placeholders", "deal"])}
        ariaLabelSearch={translateText(["ariaLabels", "deal"])}
      />

      <label htmlFor="taskOwner" className="subtitle1">
        {translateText(["labels", "taskOwner"])}
      </label>
      {/* TODO: Placeholder for SearchableDropdown. Will be implemented with backend. */}
      <AvatarChipsInput
        filteredResults={filteredOwnerOptions}
        selectedChips={selectedOwnerChip ? [selectedOwnerChip] : []}
        searchText={ownerSearchText}
        onChipSelect={handleOwnerChipSelect}
        onChipRemove={handleOwnerChipRemove}
        onSearchTextChange={handleOwnerSearchTextChange}
        searchPlaceholder={translateText(["placeholders", "taskOwner"])}
        ariaLabelSearch={translateText(["ariaLabels", "taskOwner"])}
        ariaLabelClearButton={translateText(["ariaLabels", "removeOwner"])}
      />

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

export default AddTaskModal;
