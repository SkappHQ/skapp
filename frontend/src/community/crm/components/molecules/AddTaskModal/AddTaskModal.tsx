import {
  AvatarChip,
  ButtonV2,
  CalendarIcon,
  CloseIcon,
  DatePicker,
  Dropdown,
  InputField,
  Label,
  SearchInputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCrmStore } from "~community/crm/store/store";
import { CrmTaskAddFormTypes } from "~community/crm/types/CommonTypes";
import { addTaskValidations } from "~community/crm/utils/taskValidations";

const AddTaskModal: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const PRIORITY_OPTIONS = [
    {
      id: "high",
      label: (
        <Label
          backgroundColor="bg-semantic-red-background"
          textColor="text-semantic-red-text"
        >
          {translateText(["priorityOptions", "high"])}
        </Label>
      ),
      value: "HIGH"
    },
    {
      id: "medium",
      label: (
        <Label
          backgroundColor="bg-semantic-amber-background"
          textColor="text-semantic-amber-text"
        >
          {translateText(["priorityOptions", "medium"])}
        </Label>
      ),
      value: "MEDIUM"
    },
    {
      id: "low",
      label: (
        <Label
          backgroundColor="bg-semantic-green-background"
          textColor="text-semantic-green-text"
        >
          {translateText(["priorityOptions", "low"])}
        </Label>
      ),
      value: "LOW"
    }
  ];

  const { setIsAddTaskModalOpen } = useCrmStore((store) => ({
    setIsAddTaskModalOpen: store.setIsAddTaskModalOpen
  }));

  const taskTypeOptions: { id: string; label: string; value: string }[] = [];

  const initialValues: CrmTaskAddFormTypes = {
    name: "",
    type: null,
    dueDate: null,
    priority: PRIORITY_OPTIONS[1].value,
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

  const createTask = (values: CrmTaskAddFormTypes) => {
    // TODO: Build payload and call API
    handleSuccess();
    handleError();
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
        options={PRIORITY_OPTIONS}
        value={values.priority ?? undefined}
        onChange={(value) => setFieldValue("priority", value)}
        errorMessage={errors.priority || ""}
        width="100%"
        className="rounded-[0.5rem]"
      />

      <div className="flex flex-col w-full gap-1">
        <label className="subtitle1 leading-normal text-black">
          {translateText(["labels", "contactName"])}
        </label>
        <SearchInputField
          inputId="contact"
          searchText={values.contactName}
          onSearchTextChange={(val) => setFieldValue("contactName", val)}
          filteredResults={["John Doe", "Jane Smith"]}
          onItemSelect={(item) => setFieldValue("contactName", item || "")}
          selectedItemText={values.contactName}
          renderItem={(item: string) => (
            <div>
              <AvatarChip label={item} />
            </div>
          )}
          placeholder={translateText(["placeholders", "contactName"])}
        />
        {errors.contactName && (
          <div className="text-xs text-red-500 mt-1">{errors.contactName}</div>
        )}
      </div>

      <div className="flex flex-col w-full gap-1">
        <label className="subtitle1 leading-normal text-black">
          {translateText(["labels", "deal"])}
        </label>
        <SearchInputField
          inputId="deal"
          searchText={values.deal}
          onSearchTextChange={(val) => setFieldValue("deal", val)}
          filteredResults={["John Doe", "Jane Smith"]}
          onItemSelect={(item) => setFieldValue("deal", item || "")}
          selectedItemText={values.deal}
          renderItem={(item: string) => (
            <div>
              <AvatarChip label={item} />
            </div>
          )}
          placeholder={translateText(["placeholders", "deal"])}
        />
        {errors.deal && (
          <div className="text-xs text-red-500 mt-1">{errors.deal}</div>
        )}
      </div>

      <div className="flex flex-col w-full gap-1">
        <label className="subtitle1 leading-normal text-black">
          {translateText(["labels", "taskOwner"])}
        </label>
        <div className="h-12 rounded-lg bg-gray-100 flex items-center px-3">
          <AvatarChip
            label={"Jane Doe"}
            avatarProps={{
              id : "owner-avatar",
              firstName: "Jane",
              lastName: "Doe",
              size: "sm"
            }}
          />
        </div>
      </div>

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
