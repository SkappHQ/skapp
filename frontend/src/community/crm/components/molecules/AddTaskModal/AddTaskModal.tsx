import {
  AvatarChip,
  ButtonV2,
  CalendarIcon,
  CloseIcon,
  DatePicker,
  Dropdown,
  InputField,
  Label,
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
import { priorityOptions } from "~community/crm/constants/companyConstants";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmTaskAddFormTypes,
  CrmTaskCreatePayload
} from "~community/crm/types/CommonTypes";
import { addTaskValidations } from "~community/crm/utils/taskValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

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

  const { data: me } = useGetUserPersonalDetails();

  const defaultOwner = useMemo(() => {
    if (!me?.employeeId) return null;
    return {
      employeeId: me.employeeId,
      firstName: me.firstName,
      lastName: me.lastName,
      authPic: me.authPic as string | null
    };
  }, [me]);

  const [selectedOwner, setSelectedOwner] =
    useState<SearchableDropdownItem | null>(null);
  const [ownerSearchText, setOwnerSearchText] = useState("");

  const getPriorityOptions = useMemo(
    () =>
      priorityOptions.map((option) => ({
        id: option.key,
        label: (
          <Label
            key={option.key}
            backgroundColor={option.backgroundColor}
            textColor={option.textColor}
          >
            {translateText(["priorityOptions", option.key])}
          </Label>
        ),
        value: option.value
      })),
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
  const ownerOptions = useMemo(
    () => [
      {
        optionId: "owner-1",
        chipContent: {
          label: "Jane Doe",
          avatarProps: {
            id: "owner-avatar",
            firstName: "Jane",
            lastName: "Doe"
          }
        },
        type: "user"
      },
      {
        optionId: "owner-2",
        chipContent: {
          label: "John Smith",
          avatarProps: {
            id: "owner-avatar-2",
            firstName: "John",
            lastName: "Smith"
          }
        },
        type: "user"
      }
    ],
    []
  );

  // TODO: Replace with API data when backend integrated
  const contactOptions = useMemo(() => ["John Doe", "Jane Smith"], []);
  const dealOptions = useMemo(() => ["deal1", "deal2"], []);

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
    setIsAddTaskModalOpen(false);
    resetForm();
    setOwnerSearchText("");
  };

  const filteredContactOptions = useMemo(
    () =>
      values.contactName
        ? contactOptions.filter((c) =>
            c.toLowerCase().includes(values.contactName!.toLowerCase())
          )
        : contactOptions,
    [contactOptions, values.contactName]
  );

  const filteredDealOptions = useMemo(
    () =>
      values.deal
        ? dealOptions.filter((d) =>
            d.toLowerCase().includes(values.deal!.toLowerCase())
          )
        : dealOptions,
    [dealOptions, values.deal]
  );

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
    setSelectedOwner(owner);
    setFieldValue("owner", owner.id);
    setOwnerSearchText("");
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
        options={getPriorityOptions}
        value={values.priority ?? undefined}
        onChange={(value) => setFieldValue("priority", value)}
        errorMessage={errors.priority || ""}
        width="100%"
        className="rounded-lg"
        ariaLabel={translateText(["ariaLabels", "priority"])}
      />

      {/* TODO: Replace hardcoded options with API data when backend integrated */}
      <SearchableDropdown
        id="contact-search"
        label={translateText(["labels", "contactName"])}
        placeholder={translateText(["placeholders", "contactName"])}
        value={values.contactName ?? ""}
        onChange={(e) => setFieldValue("contactName", e.target.value)}
        items={filteredContactOptions.map((c) => ({ id: c, content: c }))}
        onSelect={(item) => setFieldValue("contactName", item.id)}
      />

      {/* TODO: Replace hardcoded options with API data when backend integrated */}
      <SearchableDropdown
        id="deal-search"
        label={translateText(["labels", "deal"])}
        placeholder={translateText(["placeholders", "deal"])}
        value={values.deal ?? ""}
        onChange={(e) => setFieldValue("deal", e.target.value)}
        items={filteredDealOptions.map((d) => ({ id: d, content: d }))}
        onSelect={(item) => setFieldValue("deal", item.id)}
      />

      <SearchableDropdown
        id="owner-search"
        items={filteredOwnerOptions.map((opt) => ({
          id: opt.optionId,
          content: (
            <AvatarChip
              label={opt.chipContent.label}
              avatarProps={opt.chipContent.avatarProps}
            />
          ) as React.ReactNode
        }))}
        onSelect={handleOwnerSelect}
        label={translateText(["labels", "taskOwner"])}
        placeholder={translateText(["placeholders", "taskOwner"])}
        value={ownerSearchText}
        onChange={(e) => setOwnerSearchText(e.target.value)}
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
