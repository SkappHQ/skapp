import {
  AvatarChip,
  ButtonV2,
  CalendarIcon,
  CloseIcon,
  DatePicker,
  Dropdown,
  InputField,
  Label,
  SearchIcon,
  TextArea,
  UserChip
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCrmStore } from "~community/crm/store/store";
import { CrmTaskAddFormTypes } from "~community/crm/types/CommonTypes";
import { addTaskValidations } from "~community/crm/utils/taskValidations";

const AddTaskModal: React.FC = () => {
  const { setToastMessage } = useToast();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const PRIORITY_OPTIONS = [
    {
      id: "high",
      label: translateText(["priorityOptions", "high"]),
      value: "HIGH"
    },
    {
      id: "medium",
      label: translateText(["priorityOptions", "medium"]),
      value: "MEDIUM"
    },
    {
      id: "low",
      label: translateText(["priorityOptions", "low"]),
      value: "LOW"
    }
  ];

  const { setIsAddTaskModalOpen } = useCrmStore((store) => ({
    setIsAddTaskModalOpen: store.setIsAddTaskModalOpen
  }));

  // TODO: Import task API hooks once available
  // import { useCreateNewTask } from "~community/crm/api/TaskApi";

  // const { data: taskTypes } = useGetTaskTypes();
  const taskTypeOptions: { id: string; label: string; value: string }[] = [];

  const initialValues: CrmTaskAddFormTypes = {
    name: "",
    type: null,
    dueDate: null,
    priority: null,
    contactName: "",
    deal: "",
    owner: null,
    notes: ""
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

  // TODO: Uncomment when API hook is available
  // const { mutate: createNewTask, isPending } = useCreateNewTask(
  //   handleSuccess,
  //   handleError
  // );

  const createTask = (values: CrmTaskAddFormTypes) => {
    // TODO: Build payload and call API
    // const payload: CrmTaskCreatePayload = { ... };
    // createNewTask(payload);
    void values;
    void handleSuccess;
    void handleError;
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
        errorMessage={errors.type || ""}
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
        <div className="w-full">
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
        options={PRIORITY_OPTIONS}
        value={values.priority ?? undefined}
        onChange={(value) => setFieldValue("priority", value)}
        errorMessage={errors.priority || ""}
        width="100%"
        className="rounded-[0.5rem]"
      />

      <InputField
        name="contactName"
        value={values.contactName}
        errorMessage={errors.contactName}
        state={errors.contactName ? "error" : "default"}
        label={translateText(["labels", "contactName"])}
        placeholder={translateText(["placeholders", "contactName"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "contactName"])}
        rightIcon={<SearchIcon />}
        fullWidth
      />

      <InputField
        name="deal"
        value={values.deal}
        errorMessage={errors.deal}
        state={errors.deal ? "error" : "default"}
        label={translateText(["labels", "deal"])}
        placeholder={translateText(["placeholders", "deal"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "deal"])}
        rightIcon={<SearchIcon />}
        fullWidth
      />

      <InputField
        label={translateText(["labels", "taskOwner"])}
        name="owner"
        value={values.owner ?? ""}
        placeholder={
          values.owner ? "" : translateText(["placeholders", "taskOwner"])
        }
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "taskOwner"])}
        fullWidth
      />

      <TextArea
        name="notes"
        value={values.notes}
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
