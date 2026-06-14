import {
  AvatarChip,
  ButtonV2,
  CalendarIcon,
  CloseIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC, useEffect, useMemo, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { concatStrings } from "~community/common/utils/commonUtil";
import {
  useGetCrmContacts,
  useGetOwnerLookup
} from "~community/crm/api/ContactApi";
import { useCreateTask } from "~community/crm/api/TaskApi";
import { useGetDealLookup } from "~community/crm/api/crmDealApi";
import SelectedOwnerField from "~community/crm/components/molecules/SelectedOwnerField/SelectedOwnerField";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
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

const AddTaskModalContent: FC = () => { // TODO: Refactor to separate form and logic
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const { setIsTaskModalOpen } = useCrmStore((store) => ({
    setIsTaskModalOpen: store.setIsTaskModalOpen
  }));

  const { data: currentUser } = useGetUserPersonalDetails();

  const { isCrmSalesManager } = useSessionData();

  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(null);
  const [ownerSearchText, setOwnerSearchText] = useState("");

  const [contactSearchText, setContactSearchText] = useState("");
  const [selectedContactLabel, setSelectedContactLabel] = useState("");

  const [dealSearchText, setDealSearchText] = useState("");
  const [selectedDealLabel, setSelectedDealLabel] = useState("");

  const debouncedOwnerSearch = useDebounce(
    ownerSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const debouncedContactSearch = useDebounce(
    contactSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const debouncedDealSearch = useDebounce(
    dealSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const priorityDropdownOptions = useGetPriorityOptions();
  const { options: taskTypeOptions, getCategoryById } = useGetTaskTypeOptions();

  const defaultOwner = useMemo((): CrmOwner | null => {
    if (!currentUser?.employeeId) return null;
    return {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? null,
      authPic: currentUser.authPic as string | null
    };
  }, [currentUser]);

  useEffect(() => {
    if (defaultOwner) {
      setSelectedOwner(defaultOwner);
    }
  }, [defaultOwner]);

  const initialValues: CrmTaskAddFormTypes = {
    name: "",
    type: null,
    dueDate: null,
    priority: CrmPriorityEnum.MEDIUM,
    contactId: null,
    dealId: null,
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

  const { data: ownerLookupData, isFetching: isOwnerFetching } =
    useGetOwnerLookup(
      debouncedOwnerSearch,
      DEFAULT_LOOKUP_PAGE_SIZE,
      Boolean(isCrmSalesManager)
    );

  const ownerDropdownItems: SearchableDropdownItem[] =
    ownerLookupData?.items?.map((owner) => ({
      id: String(owner.employeeId),
      content: (
        <AvatarChip
          avatarProps={{
            id: String(owner.employeeId),
            firstName: owner.firstName,
            lastName: owner.lastName ?? undefined,
            src: useGetImageUrl(owner.authPic ?? "") ?? undefined, // TODO: Move this out
            size: "sm"
          }}
          label={concatStrings([owner.firstName, owner.lastName ?? ""])}
        />
      )
    })) ?? [];

  const { data: contactLookupData, isFetching: isContactFetching } =
    useGetCrmContacts(debouncedContactSearch, DEFAULT_LOOKUP_PAGE_SIZE);

  const contactDropdownItems: SearchableDropdownItem[] =
    contactLookupData?.items?.map((contact) => ({
      id: String(contact.id),
      content: contact.name
    })) ?? [];

  const { data: dealLookupData, isFetching: isDealFetching } = useGetDealLookup(
    debouncedDealSearch,
    DEFAULT_LOOKUP_PAGE_SIZE
  );

  const dealDropdownItems: SearchableDropdownItem[] =
    dealLookupData?.map((deal) => ({
      id: String(deal.id),
      content: deal.name
    })) ?? [];

  const handleCloseModal = (): void => {
    setIsTaskModalOpen(false);
    resetForm();
    setOwnerSearchText("");
    setSelectedOwner(defaultOwner);
    setContactSearchText("");
    setSelectedContactLabel("");
    setDealSearchText("");
    setSelectedDealLabel("");
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

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    const owner = ownerLookupData?.items?.find(
      (o) => String(o.employeeId) === item.id
    );
    if (!owner) return;
    setFieldValue("owner", owner.employeeId);
    setSelectedOwner(owner);
    setOwnerSearchText("");
  };

  const handleContactSelect = (item: SearchableDropdownItem) => {
    const contact = contactLookupData?.items?.find(
      (c) => String(c.id) === item.id
    );
    setFieldValue("contactId", Number(item.id));
    setSelectedContactLabel(contact?.name ?? String(item.content));
    setContactSearchText("");
  };

  const handleClearContact = () => {
    setFieldValue("contactId", null);
    setSelectedContactLabel("");
    setContactSearchText("");
  };

  const handleDealSelect = (item: SearchableDropdownItem) => {
    const deal = dealLookupData?.find((d) => String(d.id) === item.id);
    setFieldValue("dealId", Number(item.id));
    setSelectedDealLabel(deal?.name ?? String(item.content));
    setDealSearchText("");
  };

  const handleClearDeal = () => {
    setFieldValue("dealId", null);
    setSelectedDealLabel("");
    setDealSearchText("");
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

  return (
    <div className="flex flex-col w-full h-full justify-between gap-[0.625rem]">
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

      <div className="flex flex-row gap-[0.625rem]">
        <div className="flex-1">
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
        </div>
        <div className="flex-1">
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
        </div>
      </div>

      <div className="flex flex-row gap-[0.625rem]">
        <div className="flex-1">
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
        </div>
        <div className="flex-1">
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
              items={ownerDropdownItems}
              onSelect={handleOwnerSelect}
              label={translateText(["labels", "taskOwner"])}
              placeholder={translateText(["placeholders", "taskOwner"])}
              value={ownerSearchText}
              onChange={(e) => setOwnerSearchText(e.target.value)}
              state={errors.owner ? "error" : "default"}
              errorMessage={errors.owner}
              emptyMessage={
                isOwnerFetching ? undefined : (
                  <p className="px-4 py-2 body2">
                    {translateText(["emptyStates", "noOwners"])}
                  </p>
                )
              }
            />
          )}
        </div>
      </div>

      {values.contactId == null ? (
        <SearchableDropdown
          id="contact-search"
          label={translateText(["labels", "contactName"])}
          placeholder={translateText(["placeholders", "contactName"])}
          value={contactSearchText}
          onChange={(e) => setContactSearchText(e.target.value)}
          items={contactDropdownItems}
          onSelect={handleContactSelect}
          onClose={() => setContactSearchText("")}
          emptyMessage={
            isContactFetching ? undefined : (
              <p className="px-4 py-2 body2">
                {translateText(["emptyStates", "noContacts"])}
              </p>
            )
          }
        />
      ) : (
        <InputField
          label={translateText(["labels", "contactName"])}
          value={selectedContactLabel}
          readOnly
          fullWidth
          variant="md"
          aria-label={translateText(["ariaLabels", "contactName"])}
          rightIcon={
            <ButtonV2
              variant="tertiary"
              type="button"
              onClick={handleClearContact}
              aria-label={translateText(["ariaLabels", "clearContact"])}
              icon={<CloseIcon />}
            />
          }
        />
      )}

      {values.dealId == null ? (
        <SearchableDropdown
          id="deal-search"
          label={translateText(["labels", "deal"])}
          placeholder={translateText(["placeholders", "deal"])}
          value={dealSearchText}
          onChange={(e) => setDealSearchText(e.target.value)}
          items={dealDropdownItems}
          onSelect={handleDealSelect}
          onClose={() => setDealSearchText("")}
          emptyMessage={
            isDealFetching ? undefined : (
              <p className="px-4 py-2 body2">
                {translateText(["emptyStates", "noDeals"])}
              </p>
            )
          }
        />
      ) : (
        <InputField
          label={translateText(["labels", "deal"])}
          value={selectedDealLabel}
          readOnly
          fullWidth
          variant="md"
          aria-label={translateText(["ariaLabels", "deal"])}
          rightIcon={
            <ButtonV2
              variant="tertiary"
              type="button"
              onClick={handleClearDeal}
              aria-label={translateText(["ariaLabels", "clearDeal"])}
              icon={<CloseIcon />}
            />
          }
        />
      )}

      <TextArea
        name="notes"
        value={values.notes}
        placeholder={translateText(["placeholders", "notes"])}
        label={translateText(["labels", "notes"])}
        onChange={handleChange}
        rows={3}
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
