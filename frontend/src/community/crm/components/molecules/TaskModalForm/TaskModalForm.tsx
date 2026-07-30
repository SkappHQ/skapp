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
import { FC, useEffect, useMemo, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { convertUTCStringToLocalDateTime } from "~community/common/utils/dateTimeUtils";
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
import useGetTaskTypeOptions from "~community/crm/hooks/useGetTaskTypeOptions";
import { useCrmStore } from "~community/crm/store/store";
import { CrmOwner, CrmTaskFormTypes } from "~community/crm/types/CommonTypes";

interface TaskFormProps {
  formik: FormikProps<CrmTaskFormTypes>;
  isPending: boolean;
  translateText: TranslatorFunctionType;
  initialOwner?: CrmOwner | null;
}

const TaskModalForm: FC<TaskFormProps> = ({
  formik,
  isPending,
  initialOwner,
  translateText
}) => {
  const {
    setIsTaskModalOpen,
    selectedTaskId,
    selectedContactId,
    getContactById,
    getTaskById
  } = useCrmStore((store) => ({
    setIsTaskModalOpen: store.setIsTaskModalOpen,
    selectedTaskId: store.selectedTaskId,
    selectedContactId: store.selectedContactId,
    getContactById: store.getContactById,
    getTaskById: store.getTaskById
  }));

  const { isCrmSalesManager } = useSessionData();

  const selectedTask = getTaskById(selectedTaskId!);

  const priorityDropdownOptions = useGetPriorityOptions(translateText);
  const { options: taskTypeOptions, getCategoryById } =
    useGetTaskTypeOptions(translateText);

  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(
    selectedTask?.owner ?? initialOwner ?? null
  );
  const [ownerSearchText, setOwnerSearchText] = useState("");
  const [contactSearchText, setContactSearchText] = useState("");
  const [selectedContactName, setSelectedContactName] = useState(
    getContactById(selectedContactId!)?.name ??
      selectedTask?.contact?.name ??
      ""
  );
  const [dealSearchText, setDealSearchText] = useState("");
  const [selectedDealName, setSelectedDealName] = useState(
    selectedTask?.deal?.name ?? ""
  );

  useEffect(() => {
    if (selectedTask) {
      setSelectedOwner(selectedTask.owner ?? initialOwner ?? null);
      setSelectedContactName(
        getContactById(selectedContactId!)?.name ??
          selectedTask?.contact?.name ??
          ""
      );
      setSelectedDealName(selectedTask.deal?.name ?? "");
    } else if (initialOwner) {
      setSelectedOwner(initialOwner);
    }
  }, [initialOwner, selectedTask, selectedContactId, getContactById]);

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

  const isContactSearchEnabled =
    debouncedContactSearchText.length > 0 || !!formik.values.dealId;
  const { data: contactLookupData } = useGetCrmContacts(
    debouncedContactSearchText,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isContactSearchEnabled,
    formik.values.dealId
  );

  const isDealSearchEnabled =
    debouncedDealSearchText.length > 0 || !!formik.values.contactId;
  const { data: dealLookupData } = useGetDealLookup(
    debouncedDealSearchText,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isDealSearchEnabled,
    formik.values.contactId
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
          <span className="block w-full truncate" title={contact.name}>
            {contact.name}
          </span>
        )
      })) ?? [],
    [contactLookupData]
  );

  const dealDropdownItems: SearchableDropdownItem[] = useMemo(
    () =>
      dealLookupData?.items?.map((deal) => ({
        id: String(deal.id),
        content: (
          <span className="block w-full truncate" title={deal.name}>
            {deal.name}
          </span>
        )
      })) ?? [],
    [dealLookupData]
  );

  const clearError = (field: keyof CrmTaskFormTypes) =>
    formik.setFieldError(field, undefined);

  const handleTypeSelect = (value: string) => {
    formik.setFieldValue("type", getCategoryById(Number(value)) ?? null);
    clearError("type");
  };

  const handleDueDateSelect = (date: Date | undefined) => {
    formik.setFieldValue("dueDate", date?.toISOString() ?? null);
    clearError("dueDate");
  };

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    const owner = ownerLookupData?.items?.find(
      (ownerLookupItem) => String(ownerLookupItem.employeeId) === item.id
    );
    formik.setFieldValue("owner", owner?.employeeId);
    clearError("owner");
    setSelectedOwner(owner ?? null);
    setOwnerSearchText("");
  };

  const handleContactSelect = (item: SearchableDropdownItem) => {
    const contact = contactLookupData?.items?.find(
      (contactLookupItem) => String(contactLookupItem.id) === item.id
    );
    formik.setFieldValue("contactId", Number(item.id));
    setSelectedContactName(contact?.name ?? "");
    setContactSearchText("");
  };

  const handleDealSelect = (item: SearchableDropdownItem) => {
    const deal = dealLookupData?.items?.find(
      (dealLookupItem) => String(dealLookupItem.id) === item.id
    );
    formik.setFieldValue("dealId", Number(item.id));
    setSelectedDealName(deal?.name ?? "");
    setDealSearchText("");
  };

  const handleClearOwner = () => {
    setSelectedOwner(null);
    formik.setFieldValue("owner", null);
  };

  const handleClearContact = () => {
    formik.setFieldValue("contactId", null);
    setSelectedContactName("");
    setContactSearchText("");
  };

  const handleClearDeal = () => {
    formik.setFieldValue("dealId", null);
    setSelectedDealName("");
    setDealSearchText("");
  };

  const parsedDueDate = formik.values.dueDate
    ? convertUTCStringToLocalDateTime(formik.values.dueDate).toJSDate()
    : undefined;

  const formattedDueDate = parsedDueDate
    ? parsedDueDate.toLocaleDateString()
    : "";

  return (
    <div className="flex flex-col w-full h-full justify-between gap-[0.625rem] max-h-[78vh]">
      <div className="flex flex-col gap-[0.625rem] overflow-y-auto pr-1">
        <InputField
          name="name"
          value={formik.values.name}
          errorMessage={formik.errors.name}
          state={formik.errors.name ? "error" : "default"}
          label={translateText(["labels", "task"])}
          placeholder={translateText(["placeholders", "task"])}
          onChange={(e) => {
            formik.handleChange(e);
            clearError("name");
          }}
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
              value={formik.values.type?.id?.toString() ?? undefined}
              onChange={handleTypeSelect}
              errorMessage={formik.errors.type}
              variant={formik.errors.type ? "primary-error" : "primary"}
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
              value={formik.values.priority ?? undefined}
              onChange={(value) => formik.setFieldValue("priority", value)}
              errorMessage={formik.errors.priority || ""}
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
            >
              <div>
                <InputField
                  name="dueDate"
                  value={formattedDueDate}
                  label={translateText(["labels", "dueDate"])}
                  placeholder={translateText(["placeholders", "dueDate"])}
                  state={formik.errors.dueDate ? "error" : "default"}
                  errorMessage={formik.errors.dueDate || ""}
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
                state={formik.errors.owner ? "error" : "default"}
                errorMessage={formik.errors.owner}
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
          value={formik.values.notes}
          placeholder={translateText(["placeholders", "notes"])}
          label={translateText(["labels", "notes"])}
          errorMessage={formik.errors.notes}
          state={formik.errors.notes ? "error" : "default"}
          onChange={(e) => {
            formik.handleChange(e);
            clearError("notes");
          }}
          rows={3}
          aria-label={translateText(["ariaLabels", "notes"])}
        />
      </div>

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={formik.isSubmitting}
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
          onClick={formik.submitForm}
          disabled={formik.isSubmitting || isPending || !formik.dirty}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default TaskModalForm;
