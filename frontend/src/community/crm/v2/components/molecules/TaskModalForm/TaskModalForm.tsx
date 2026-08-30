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
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { characterLengths } from "~community/common/constants/stringConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { convertUTCStringToLocalDateTime } from "~community/common/utils/dateTimeUtils";
import SelectableSearchField from "~community/crm/components/molecules/SelectableSearchField/SelectableSearchField";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import {
  useGetContactLookupV2,
  useGetOwnerLookupV2
} from "~community/crm/v2/api/ContactApi";
import { useGetDealLookupV2 } from "~community/crm/v2/api/DealApi";
import OwnerAvatarChip from "~community/crm/v2/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import SelectedOwnerField from "~community/crm/v2/components/molecules/SelectedOwnerField/SelectedOwnerField";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { useGetPriorityOptions } from "~community/crm/v2/hooks/useGetPriorityOptions";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { updateOwnerRecord } from "~community/crm/v2/utils/commonUtil";
import {
  getContactDisplayName,
  updateContactRecord
} from "~community/crm/v2/utils/contactUtil";
import { mergeDeals } from "~community/crm/v2/utils/dealUtil";
import { getTaskTypeOptions } from "~community/crm/v2/utils/taskUtil";

interface Props {
  formik: FormikProps<CrmTaskEntity>;
  isPending: boolean;
  translateText: TranslatorFunctionType;
  onCancel: () => void;
}

const TaskModalForm: FC<Props> = ({
  formik,
  isPending,
  translateText,
  onCancel
}) => {
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    dirty,
    isSubmitting,
    setFieldValue,
    submitForm
  } = formik;

  const { isCrmSalesManager } = useSessionData();

  const {
    taskTypes,
    contacts,
    deals,
    owners,
    setContacts,
    setDeals,
    setOwners
  } = useCrmStoreV2(
    useShallow((store) => ({
      taskTypes: store.taskTypes,
      contacts: store.contacts,
      deals: store.deals,
      owners: store.owners,
      setContacts: store.setContacts,
      setDeals: store.setDeals,
      setOwners: store.setOwners
    }))
  );

  const [ownerSearchTerm, setOwnerSearchTerm] = useState("");
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [dealSearchTerm, setDealSearchTerm] = useState("");

  const debouncedOwnerSearch = useDebounce(
    ownerSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const debouncedContactSearch = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const debouncedDealSearch = useDebounce(
    dealSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const { data: ownerLookupData } = useGetOwnerLookupV2(
    debouncedOwnerSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    Boolean(isCrmSalesManager)
  );

  const { data: contactLookupData } = useGetContactLookupV2(
    debouncedContactSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    true
  );

  const dealLookupFilter = useMemo(
    () => ({
      searchKeyword: debouncedDealSearch,
      size: DEFAULT_LOOKUP_PAGE_SIZE
    }),
    [debouncedDealSearch]
  );

  const { data: dealLookupData } = useGetDealLookupV2(dealLookupFilter, true);

  const ownerLookupItems = useMemo(
    () => ownerLookupData?.items ?? [],
    [ownerLookupData]
  );
  const contactLookupItems = useMemo(
    () => contactLookupData?.items ?? [],
    [contactLookupData]
  );
  const dealLookupItems = useMemo(
    () => dealLookupData?.items ?? [],
    [dealLookupData]
  );

  const ownerDropdownItems: SearchableDropdownItem[] = ownerLookupItems.map(
    (owner) => {
      const ownerId = String(owner.employeeId);
      return {
        id: ownerId,
        content: <OwnerAvatarChip id={ownerId} owner={owner} />
      };
    }
  );

  const contactDropdownItems: SearchableDropdownItem[] = contactLookupItems.map(
    (contact) => {
      const contactName = getContactDisplayName(contact);
      return {
        id: String(contact.id),
        content: (
          <div className="w-full truncate" title={contactName}>
            {contactName}
          </div>
        )
      };
    }
  );

  const dealDropdownItems: SearchableDropdownItem[] = dealLookupItems.map(
    (deal) => ({
      id: String(deal.id),
      content: (
        <div className="w-full truncate" title={deal.name}>
          {deal.name}
        </div>
      )
    })
  );

  const taskTypeOptions = getTaskTypeOptions(taskTypes).map((option) => ({
    ...option,
    label: translateText(["taskTypes", option.label])
  }));

  const priorityOptions = useGetPriorityOptions();

  const selectedOwner = values.ownerId ? owners[values.ownerId] : undefined;
  const selectedContact = values.contactId
    ? contacts[values.contactId]
    : undefined;
  const selectedDeal = values.dealId ? deals[values.dealId] : undefined;

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    const owner = ownerLookupItems.find(
      (lookupOwner) => String(lookupOwner.employeeId) === item.id
    );
    if (owner) setOwners(updateOwnerRecord(owners, [owner]));

    setFieldValue("ownerId", owner?.employeeId);
    setOwnerSearchTerm("");
  };

  const handleContactSelect = (item: SearchableDropdownItem) => {
    const contact = contactLookupItems.find(
      (lookupContact) => String(lookupContact.id) === item.id
    );
    if (contact) setContacts(updateContactRecord(contacts, [contact]));

    setFieldValue("contactId", contact?.id);
    setContactSearchTerm("");
  };

  const handleDealSelect = (item: SearchableDropdownItem) => {
    const deal = dealLookupItems.find(
      (lookupDeal) => String(lookupDeal.id) === item.id
    );
    if (deal) setDeals(mergeDeals(deals, [deal]));

    setFieldValue("dealId", deal?.id);
    setDealSearchTerm("");
  };

  const handleClearOwner = () => {
    setFieldValue("ownerId", "");
    setOwnerSearchTerm("");
  };

  const handleClearContact = () => {
    setFieldValue("contactId", "");
    setContactSearchTerm("");
  };

  const handleClearDeal = () => {
    setFieldValue("dealId", "");
    setDealSearchTerm("");
  };

  const handleTypeChange = (value: string) => {
    setFieldValue("typeId", Number(value));
  };

  const handlePriorityChange = (value: string) => {
    setFieldValue("priority", value as CrmPriorityEnum);
  };

  const handleDueDateSelect = (date: Date | undefined) => {
    setFieldValue("dueAt", date?.toISOString());
  };

  const dueDate = values.dueAt
    ? convertUTCStringToLocalDateTime(values.dueAt).toJSDate()
    : undefined;

  return (
    <div className="flex flex-col w-full h-full justify-between gap-[0.625rem] max-h-[78vh]">
      <div className="flex flex-col gap-[0.625rem] overflow-y-auto pr-1">
        <InputField
          name="name"
          value={values.name}
          errorMessage={errors.name}
          state={errors.name ? "error" : "default"}
          label={translateText(["labels", "task"])}
          placeholder={translateText(["placeholders", "task"])}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label={translateText(["ariaLabels", "task"])}
          maxLength={characterLengths.TASK_NAME_LENGTH}
          fullWidth
          required
        />

        <div className="flex flex-row items-start gap-[0.625rem]">
          <div className="flex-1">
            <Dropdown
              options={taskTypeOptions}
              value={values.typeId?.toString()}
              onChange={handleTypeChange}
              label={translateText(["labels", "type"])}
              placeholder={translateText(["placeholders", "type"])}
              errorMessage={errors.typeId}
              variant={errors.typeId ? "primary-error" : "primary"}
              className="rounded-lg"
              ariaLabel={translateText(["ariaLabels", "type"])}
              width="100%"
              required
            />
          </div>
          <div className="flex-1">
            <Dropdown
              options={priorityOptions}
              value={values.priority}
              onChange={handlePriorityChange}
              label={translateText(["labels", "priority"])}
              placeholder={translateText(["placeholders", "priority"])}
              className="rounded-lg"
              variant="primary"
              ariaLabel={translateText(["ariaLabels", "priority"])}
              width="100%"
            />
          </div>
        </div>

        <div className="flex flex-row items-start gap-[0.625rem]">
          <div className="flex-1">
            <DatePicker
              mode="single"
              selected={dueDate}
              onSelect={handleDueDateSelect}
              popperProps={{ position: "bottom-start", isFlip: true }}
            >
              <div>
                <InputField
                  name="dueAt"
                  value={dueDate ? dueDate.toLocaleDateString() : ""}
                  label={translateText(["labels", "dueDate"])}
                  placeholder={translateText(["placeholders", "dueDate"])}
                  errorMessage={errors.dueAt}
                  state={errors.dueAt ? "error" : "default"}
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
                showRemoveButton={Boolean(isCrmSalesManager)}
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
                value={ownerSearchTerm}
                onChange={(event) => setOwnerSearchTerm(event.target.value)}
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
          selectedValue={getContactDisplayName(selectedContact)}
          onClear={handleClearContact}
          clearAriaLabel={translateText(["ariaLabels", "clearContact"])}
          fieldAriaLabel={translateText(["ariaLabels", "contactName"])}
          searchValue={contactSearchTerm}
          onSearchChange={(event) => setContactSearchTerm(event.target.value)}
          items={contactDropdownItems}
          onSelect={handleContactSelect}
          emptyMessage={translateText(["emptyStates", "noContacts"])}
        />

        <SelectableSearchField
          id="deal-search"
          label={translateText(["labels", "deal"])}
          placeholder={translateText(["placeholders", "deal"])}
          selectedValue={selectedDeal?.name ?? ""}
          onClear={handleClearDeal}
          clearAriaLabel={translateText(["ariaLabels", "clearDeal"])}
          fieldAriaLabel={translateText(["ariaLabels", "deal"])}
          searchValue={dealSearchTerm}
          onSearchChange={(event) => setDealSearchTerm(event.target.value)}
          items={dealDropdownItems}
          onSelect={handleDealSelect}
          emptyMessage={translateText(["emptyStates", "noDeals"])}
        />

        <TextArea
          name="notes"
          value={values.notes}
          label={translateText(["labels", "notes"])}
          placeholder={translateText(["placeholders", "notes"])}
          errorMessage={errors.notes}
          state={errors.notes ? "error" : "default"}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={3}
          aria-label={translateText(["ariaLabels", "notes"])}
        />
      </div>

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isPending || isSubmitting}
          onClick={onCancel}
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
          disabled={isPending || isSubmitting || !dirty}
          isLoading={isPending}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default TaskModalForm;
