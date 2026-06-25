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
import { FC, useEffect, useMemo, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetCrmContacts,
  useGetOwnerLookup
} from "~community/crm/api/ContactApi";
import { useCreateTask } from "~community/crm/api/TaskApi";
import { useGetDealLookup } from "~community/crm/api/crmDealApi";
import OwnerDropdownItem from "~community/crm/components/atoms/OwnerDropdownItem/OwnerDropdownItem";
import SelectableSearchField from "~community/crm/components/molecules/SelectableSearchField/SelectableSearchField";
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

const AddTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const {
    setIsTaskModalOpen,
    preselectedContact,
    setPreselectedContact,
    selectedCompany
  } = useCrmStore((store) => ({
    setIsTaskModalOpen: store.setIsTaskModalOpen,
    preselectedContact: store.preselectedContact,
    setPreselectedContact: store.setPreselectedContact,
    selectedCompany: store.selectedCompany
  }));

  const { data: currentUser } = useGetUserPersonalDetails();

  const { isCrmSalesManager } = useSessionData();

  const priorityDropdownOptions = useGetPriorityOptions(translateText);

  const { options: taskTypeOptions, getCategoryById } =
    useGetTaskTypeOptions(translateText);

  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(null);
  const [ownerSearchText, setOwnerSearchText] = useState("");
  const [contactSearchText, setContactSearchText] = useState("");
  const [selectedContactName, setSelectedContactName] = useState(
    preselectedContact?.name ?? ""
  );
  const [dealSearchText, setDealSearchText] = useState("");
  const [selectedDealName, setSelectedDealName] = useState("");

  const debouncedOwnerSearchText = useDebounce(
    ownerSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const debouncedContactSearchText = useDebounce(
    contactSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const debouncedDealSearchText = useDebounce(
    dealSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const defaultOwner = useMemo((): CrmOwner | null => {
    return {
      employeeId: Number(currentUser?.employeeId),
      firstName: currentUser?.firstName ?? "",
      lastName: currentUser?.lastName ?? null,
      authPic: currentUser?.authPic as string | null
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
    contactId: preselectedContact?.id ?? null,
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

  const handleCloseModal = (): void => {
    setIsTaskModalOpen(false);
    resetForm();
    setOwnerSearchText("");
    setSelectedOwner(defaultOwner);
    setContactSearchText("");
    setSelectedContactName("");
    setPreselectedContact(null);
    setDealSearchText("");
    setSelectedDealName("");
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
    handleError,
    preselectedContact?.id,
    selectedCompany?.id
  );

  const createTask = (formValues: CrmTaskAddFormTypes) => {
    const payload: CrmTaskCreatePayload = {
      name: formValues.name.trim(),
      typeId: formValues.type?.id ?? undefined,
      dueAt: formValues.dueDate ?? null,
      priority: formValues.priority,
      contactId: formValues.contactId ?? undefined,
      dealId: formValues.dealId ?? undefined,
      ownerId: formValues.owner ?? undefined,
      notes: formValues.notes?.trim()
    };

    createNewTask(payload);
  };

  const { data: ownerLookupData } = useGetOwnerLookup(
    debouncedOwnerSearchText,
    DEFAULT_LOOKUP_PAGE_SIZE,
    Boolean(isCrmSalesManager) && debouncedOwnerSearchText.length > 0
  );

  const { data: contactLookupData } = useGetCrmContacts(
    debouncedContactSearchText,
    DEFAULT_LOOKUP_PAGE_SIZE,
    debouncedContactSearchText.length > 0
  );

  const { data: dealLookupData } = useGetDealLookup(
    debouncedDealSearchText,
    DEFAULT_LOOKUP_PAGE_SIZE,
    debouncedDealSearchText.length > 0
  );

  const ownerDropdownItems: SearchableDropdownItem[] = useMemo(
    () =>
      ownerLookupData?.items?.map((owner) => ({
        id: String(owner.employeeId),
        content: <OwnerDropdownItem owner={owner} />
      })) ?? [],
    [ownerLookupData]
  );

  const contactDropdownItems: SearchableDropdownItem[] = useMemo(
    () =>
      contactLookupData?.items?.map((contact) => ({
        id: String(contact.id),
        content: contact.name
      })) ?? [],
    [contactLookupData]
  );

  const dealDropdownItems: SearchableDropdownItem[] = useMemo(
    () =>
      dealLookupData?.items?.map((deal) => ({
        id: String(deal.id),
        content: deal.name
      })) ?? [],
    [dealLookupData]
  );

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    const owner = ownerLookupData?.items?.find(
      (ownerLookupItem) => String(ownerLookupItem.employeeId) === item.id
    );
    setFieldValue("owner", owner?.employeeId);
    setSelectedOwner(owner ?? null);
    setOwnerSearchText("");
  };

  const handleContactSelect = (item: SearchableDropdownItem) => {
    const contact = contactLookupData?.items?.find(
      (contactLookupItem) => String(contactLookupItem.id) === item.id
    );
    setFieldValue("contactId", Number(item.id));
    setSelectedContactName(contact?.name ?? String(item.content));
    setContactSearchText("");
  };

  const handleDealSelect = (item: SearchableDropdownItem) => {
    const deal = dealLookupData?.items?.find(
      (dealLookupItem) => String(dealLookupItem.id) === item.id
    );
    setFieldValue("dealId", Number(item.id));
    setSelectedDealName(deal?.name ?? String(item.content));
    setDealSearchText("");
  };
  const handleClearOwner = () => {
    setSelectedOwner(null);
    setFieldValue("owner", null);
  };

  const handleClearContact = () => {
    setFieldValue("contactId", null);
    setSelectedContactName("");
    setContactSearchText("");
  };

  const handleClearDeal = () => {
    setFieldValue("dealId", null);
    setSelectedDealName("");
    setDealSearchText("");
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

      <div className="flex flex-row items-start gap-[0.625rem]">
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

      <div className="flex flex-row items-start gap-[0.625rem]">
        <div className="flex-1">
          <DatePicker
            mode="single"
            selected={values.dueDate ? new Date(values.dueDate) : undefined}
            onSelect={(date) =>
              setFieldValue("dueDate", date?.toISOString() ?? null)
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
                handleClearOwner();
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
              emptyMessage={translateText(["emptyStates", "noOwners"])}
            />
          )}
        </div>
      </div>

      <SelectableSearchField
        id="contact-search"
        label={translateText(["labels", "contactName"])}
        placeholder={translateText(["placeholders", "contactName"])}
        selectedValue={selectedContactName}
        onClear={handleClearContact}
        clearAriaLabel={translateText(["ariaLabels", "clearContact"])}
        fieldAriaLabel={translateText(["ariaLabels", "contactName"])}
        searchValue={contactSearchText}
        onSearchChange={(e) => setContactSearchText(e.target.value)}
        items={contactDropdownItems}
        onSelect={handleContactSelect}
        emptyMessage={translateText(["emptyStates", "noContacts"])}
      />

      <SelectableSearchField
        id="deal-search"
        label={translateText(["labels", "deal"])}
        placeholder={translateText(["placeholders", "deal"])}
        selectedValue={selectedDealName}
        onClear={handleClearDeal}
        clearAriaLabel={translateText(["ariaLabels", "clearDeal"])}
        fieldAriaLabel={translateText(["ariaLabels", "deal"])}
        searchValue={dealSearchText}
        onSearchChange={(e) => setDealSearchText(e.target.value)}
        items={dealDropdownItems}
        onSelect={handleDealSelect}
        emptyMessage={translateText(["emptyStates", "noDeals"])}
      />

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
