import {
  ButtonV2,
  CalendarIcon,
  CloseIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { convertUTCStringToLocalDateTime } from "~community/common/utils/dateTimeUtils";
// The contact, owner and deal lookups have no v2 equivalent yet, so the v1
// endpoints are reused. They return the v1 lookup shapes, which stay local to
// this form - nothing from them is written into the v2 store.
import {
  useGetCrmContacts,
  useGetOwnerLookup
} from "~community/crm/api/ContactApi";
import { useGetDealLookup } from "~community/crm/api/crmDealApi";
import OwnerDropdownItem from "~community/crm/components/atoms/OwnerDropdownItem/OwnerDropdownItem";
import SelectableSearchField from "~community/crm/components/molecules/SelectableSearchField/SelectableSearchField";
import SelectedOwnerField from "~community/crm/components/molecules/SelectedOwnerField/SelectedOwnerField";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import useGetPriorityOptions from "~community/crm/hooks/useGetPriorityOptions";
import { CrmOwner } from "~community/crm/types/CommonTypes";
import useGetTaskTypeOptions from "~community/crm/v2/hooks/useGetTaskTypeOptions";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmOwnerEntity,
  CrmTaskEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";

interface TaskFormProps {
  formik: FormikProps<CrmTaskEntity>;
  isPending: boolean;
  translateText: TranslatorFunctionType;
  initialOwner?: CrmOwnerEntity | null;
}

/**
 * The owner controls below are v1 components typed against the v1 lookup shape.
 * The store holds a `CrmOwnerEntity`, so the one owner read out of the store is
 * widened here rather than duplicating those controls.
 */
const toLookupOwner = (
  owner: CrmOwnerEntity | null | undefined
): CrmOwner | null =>
  owner == null
    ? null
    : {
        employeeId: owner.employeeId,
        firstName: owner.firstName,
        lastName: owner.lastName ?? null,
        authPic: owner.authPic ?? null
      };

const TaskModalForm: FC<TaskFormProps> = ({
  formik,
  isPending,
  initialOwner,
  translateText
}) => {
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    dirty,
    isSubmitting,
    setFieldValue,
    setFieldError,
    submitForm
  } = formik;

  const {
    setIsTaskModalOpen,
    selectedTaskId,
    selectedContactId,
    selectedCompanyId,
    isCrmSidePanelOpen,
    crmSidePanelType,
    tasks,
    owners,
    contacts,
    deals
  } = useCrmStoreV2((state) => ({
    setIsTaskModalOpen: state.setIsTaskModalOpen,
    selectedTaskId: state.selectedTaskId,
    selectedContactId: state.selectedContactId,
    selectedCompanyId: state.selectedCompanyId,
    isCrmSidePanelOpen: state.isCrmSidePanelOpen,
    crmSidePanelType: state.crmSidePanelType,
    tasks: state.tasks,
    owners: state.owners,
    contacts: state.contacts,
    deals: state.deals
  }));

  const selectedTask = selectedTaskId ? tasks[selectedTaskId] : undefined;
  const taskOwner = selectedTask?.ownerId
    ? owners[selectedTask.ownerId]
    : undefined;
  const taskContact = selectedTask?.contactId
    ? contacts[selectedTask.contactId]
    : undefined;
  const panelContact = selectedContactId
    ? contacts[selectedContactId]
    : undefined;
  const taskDeal = selectedTask?.dealId
    ? deals[selectedTask.dealId]
    : undefined;

  const { isCrmSalesManager } = useSessionData();

  const priorityDropdownOptions = useGetPriorityOptions(translateText);
  const { options: taskTypeOptions } = useGetTaskTypeOptions(translateText);

  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(
    toLookupOwner(taskOwner) ?? toLookupOwner(initialOwner)
  );
  const [ownerSearchText, setOwnerSearchText] = useState("");
  const [contactSearchText, setContactSearchText] = useState("");
  const [selectedContactName, setSelectedContactName] = useState(
    panelContact?.name ?? taskContact?.name ?? ""
  );
  const [dealSearchText, setDealSearchText] = useState("");
  const [selectedDealName, setSelectedDealName] = useState(
    taskDeal?.name ?? ""
  );

  useEffect(() => {
    if (selectedTask) {
      setSelectedOwner(toLookupOwner(taskOwner) ?? toLookupOwner(initialOwner));
      setSelectedContactName(panelContact?.name ?? taskContact?.name ?? "");
      setSelectedDealName(taskDeal?.name ?? "");
    } else if (initialOwner) {
      setSelectedOwner(toLookupOwner(initialOwner));
    }
  }, [
    initialOwner,
    selectedTask,
    taskOwner,
    taskContact,
    panelContact,
    taskDeal
  ]);

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

  const handleCloseModal = (): void => {
    setIsTaskModalOpen(false);
  };

  const { data: ownerLookupData } = useGetOwnerLookup(
    debouncedOwnerSearchText,
    DEFAULT_LOOKUP_PAGE_SIZE,
    Boolean(isCrmSalesManager) && debouncedOwnerSearchText.length > 0
  );

  const companyScopeId =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.COMPANY_SIDE_PANEL
      ? selectedCompanyId
      : null;

  const hasSelectedContact = values.contactId != null;
  const hasSelectedDeal = values.dealId != null;

  const contactLookupCompanyId = hasSelectedDeal ? null : companyScopeId;

  const isContactSearchEnabled =
    debouncedContactSearchText.length > 0 ||
    hasSelectedDeal ||
    contactLookupCompanyId != null;
  const { data: contactLookupData } = useGetCrmContacts(
    debouncedContactSearchText,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isContactSearchEnabled,
    values.dealId,
    contactLookupCompanyId
  );

  const dealLookupCompanyId = hasSelectedContact ? null : companyScopeId;

  const isDealSearchEnabled =
    debouncedDealSearchText.length > 0 ||
    hasSelectedContact ||
    dealLookupCompanyId != null;
  const { data: dealLookupData } = useGetDealLookup(
    debouncedDealSearchText,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isDealSearchEnabled,
    values.contactId,
    dealLookupCompanyId
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
        content: (
          <div className="w-full truncate" title={contact.name}>
            {contact.name}
          </div>
        )
      })) ?? [],
    [contactLookupData]
  );

  const dealDropdownItems: SearchableDropdownItem[] = useMemo(
    () =>
      dealLookupData?.items?.map((deal) => ({
        id: String(deal.id),
        content: (
          <div className="w-full truncate" title={deal.name}>
            {deal.name}
          </div>
        )
      })) ?? [],
    [dealLookupData]
  );

  const clearError = (field: keyof CrmTaskEntity) =>
    setFieldError(field, undefined);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    clearError("name");
  };

  const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    clearError("notes");
  };

  const handleTypeSelect = (value: string) => {
    setFieldValue("typeId", Number(value));
    clearError("typeId");
  };

  const handleDueDateSelect = (date: Date | undefined) => {
    setFieldValue("dueAt", date?.toISOString());
    clearError("dueAt");
  };

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    const owner = ownerLookupData?.items?.find(
      (ownerLookupItem) => String(ownerLookupItem.employeeId) === item.id
    );
    setFieldValue("ownerId", owner?.employeeId);
    clearError("ownerId");
    setSelectedOwner(owner ?? null);
    setOwnerSearchText("");
  };

  const handleContactSelect = (item: SearchableDropdownItem) => {
    const contact = contactLookupData?.items?.find(
      (contactLookupItem) => String(contactLookupItem.id) === item.id
    );
    setFieldValue("contactId", Number(item.id));
    setSelectedContactName(contact?.name ?? "");
    setContactSearchText("");
  };

  const handleDealSelect = (item: SearchableDropdownItem) => {
    const deal = dealLookupData?.items?.find(
      (dealLookupItem) => String(dealLookupItem.id) === item.id
    );
    setFieldValue("dealId", Number(item.id));
    setSelectedDealName(deal?.name ?? "");
    setDealSearchText("");

    if (deal?.contactId != null && deal?.contactName != null) {
      formik.setFieldValue("contactId", deal.contactId);
      setSelectedContactName(deal?.contactName);
      setContactSearchText("");
    }
  };

  const handleClearOwner = () => {
    setSelectedOwner(null);
    setFieldValue("ownerId", undefined);
  };

  const handleClearContact = () => {
    setFieldValue("contactId", undefined);
    setSelectedContactName("");
    setContactSearchText("");
  };

  const handleClearDeal = () => {
    setFieldValue("dealId", undefined);
    setSelectedDealName("");
    setDealSearchText("");
  };

  const parsedDueDate = values.dueAt
    ? convertUTCStringToLocalDateTime(values.dueAt).toJSDate()
    : undefined;

  const formattedDueDate = parsedDueDate
    ? parsedDueDate.toLocaleDateString()
    : "";

  return (
    <div className="flex flex-col w-full h-full justify-between gap-[0.625rem] max-h-[78vh]">
      <div className="flex flex-col gap-[0.625rem] overflow-y-auto pr-1">
        <InputField
          name="name"
          value={values.name ?? ""}
          errorMessage={errors.name}
          state={errors.name ? "error" : "default"}
          label={translateText(["labels", "task"])}
          placeholder={translateText(["placeholders", "task"])}
          onChange={handleNameChange}
          onBlur={handleBlur}
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
              value={values.typeId?.toString()}
              onChange={handleTypeSelect}
              errorMessage={errors.typeId}
              variant={errors.typeId ? "primary-error" : "primary"}
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
              value={values.priority}
              onChange={(value) => setFieldValue("priority", value)}
              errorMessage={errors.priority}
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
              selected={parsedDueDate}
              onSelect={handleDueDateSelect}
              popperProps={{ position: "bottom-start", isFlip: true }}
            >
              <div>
                <InputField
                  name="dueAt"
                  value={formattedDueDate}
                  label={translateText(["labels", "dueDate"])}
                  placeholder={translateText(["placeholders", "dueDate"])}
                  state={errors.dueAt ? "error" : "default"}
                  errorMessage={errors.dueAt}
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
                onRemove={handleClearOwner}
                showRemoveButton={isCrmSalesManager ?? false}
                ariaLabel={translateText(["ariaLabels", "removeOwner"])}
                required
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
                state={errors.ownerId ? "error" : "default"}
                errorMessage={errors.ownerId}
                emptyMessage={translateText(["emptyStates", "noOwners"])}
                required
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
          isOpenOnFocus={isContactSearchEnabled}
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
          isOpenOnFocus={isDealSearchEnabled}
        />

        <TextArea
          name="notes"
          value={values.notes ?? ""}
          placeholder={translateText(["placeholders", "notes"])}
          label={translateText(["labels", "notes"])}
          errorMessage={errors.notes}
          state={errors.notes ? "error" : "default"}
          onChange={handleNotesChange}
          onBlur={handleBlur}
          rows={3}
          aria-label={translateText(["ariaLabels", "notes"])}
        />
      </div>

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
          disabled={isSubmitting || isPending || !dirty}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default TaskModalForm;
