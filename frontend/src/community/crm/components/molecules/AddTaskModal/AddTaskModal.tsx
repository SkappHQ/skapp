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
import { concatStrings } from "~community/common/utils/commonUtil";
import { useCreateTask } from "~community/crm/api/TaskApi";
import { priorityOptions } from "~community/crm/constants/taskConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmOwner,
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

  const { data: user } = useGetUserPersonalDetails();

  const { isCrmSalesManager } = useSessionData();

  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(null);

  const [ownerSearchText, setOwnerSearchText] = useState("");

  const defaultOwner = useMemo(() => {
    if (!user?.employeeId) return null;
    return {
      employeeId: user.employeeId,
      firstName: user.firstName,
      lastName: user.lastName,
      authPic: user.authPic as string | null
    };
  }, [user]);

  const priorityDropdownOptions = useMemo(
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

  // TODO: Replace with API data when backend integrated -----------------
  const taskTypeOptions: TaskTypeOption[] = useMemo(
    () =>
      (["call", "email", "meeting", "other"] as const).map((type) => ({
        id: type,
        label: translateText(["taskTypes", type]),
        value: type.toUpperCase()
      })),
    [translateText]
  );
  const ownerOptions: CrmOwner[] = useMemo(
    () => [
      {
        firstName: "John",
        lastName: "Doe",
        employeeId: 1,
        authPic: null
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        employeeId: 2,
        authPic: null
      }
    ],
    []
  );
  const contactOptions = useMemo(() => ["John Doe", "Jane Smith"], []);
  const dealOptions = useMemo(() => ["deal1", "deal2"], []);
  // =====================================================================

  // filtration should be done in backend
  const filteredOwnerOptions: SearchableDropdownItem[] = useMemo(() => {
    const filtered = ownerOptions.filter((owner) => {
      const fullName = concatStrings([
        owner.firstName,
        owner.lastName ?? ""
      ]).toLowerCase();
      return fullName.includes(ownerSearchText.toLowerCase());
    });

    return filtered.map((opt) => ({
      id: opt.employeeId.toString(),
      content: (
        <AvatarChip
          label={concatStrings([opt.firstName, opt.lastName ?? ""])}
          avatarProps={
            opt.authPic
              ? { id: opt.employeeId.toString(), src: opt.authPic }
              : undefined
          }
        />
      ) as React.ReactNode
    }));
  }, [ownerSearchText, ownerOptions]);

  const initialValues: CrmTaskAddFormTypes = {
    name: "",
    type: taskTypeOptions[0].value,
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
    setFieldValue("owner", Number(owner.id));
    setOwnerSearchText("");
    setSelectedOwner(
      ownerOptions.find((opt) => opt.employeeId.toString() === owner.id) || null
    );
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

      {selectedOwner ? (
        <div className="flex w-full flex-col gap-2">
          <span className="subtitle1 leading-normal inline-flex h-6 items-center">
            {translateText(["labels", "taskOwner"])}
          </span>
          <div className="flex h-[3.125rem] items-center rounded-lg bg-tertiary-background">
            <AvatarChip
              label={concatStrings([
                selectedOwner.firstName,
                selectedOwner.lastName ?? ""
              ])}
              avatarProps={{
                id: selectedOwner.employeeId.toString(),
                src: selectedOwner.authPic ?? undefined,
                size: "sm"
              }}
              actionIcon={<CloseIcon />}
              onActionClick={() => {
                setSelectedOwner(null);
                setFieldValue("owner", null);
              }}
              showActionButton={isCrmSalesManager}
              aria-label={translateText(["ariaLabels", "removeOwner"])}
            />
          </div>
        </div>
      ) : (
        <SearchableDropdown
          id="owner-search"
          items={filteredOwnerOptions}
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

export default AddTaskModal;
