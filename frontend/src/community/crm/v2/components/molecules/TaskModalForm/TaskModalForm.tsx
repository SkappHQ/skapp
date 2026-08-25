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
import { CrmContactLookupParams } from "~community/crm/types/CommonTypes";
import useGetTaskTypeOptions from "~community/crm/v2/hooks/useGetTaskTypeOptions";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";
import {
  getSelectedOwner,
  mergeOwners
} from "~community/crm/v2/utils/commonUtil";
import { getSelectedContact } from "~community/crm/v2/utils/contactUtil";
import { getSelectedDeal, mergeDeals } from "~community/crm/v2/utils/dealUtil";
import {
  fromLookupOwner,
  toLookupOwner
} from "~community/crm/v2/utils/taskUtil";

interface TaskFormProps {
  formik: FormikProps<CrmTaskEntity>;
  isPending: boolean;
  translateText: TranslatorFunctionType;
}

const TaskModalForm: FC<TaskFormProps> = ({
  formik,
  isPending,
  translateText
}) => {
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    isSubmitting,
    setFieldValue,
    submitForm
  } = formik;

  const {
    setIsTaskModalOpen,
    selectedCompanyId,
    isCrmSidePanelOpen,
    crmSidePanelType,
    owners,
    contacts,
    deals,
    setOwners,
    setDeals
  } = useCrmStoreV2(
    useShallow((store) => ({
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      selectedCompanyId: store.selectedCompanyId,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      owners: store.owners,
      contacts: store.contacts,
      deals: store.deals,
      setOwners: store.setOwners,
      setDeals: store.setDeals
    }))
  );

  const { isCrmSalesManager } = useSessionData();

  const priorityDropdownOptions = useGetPriorityOptions(translateText);
  const { options: taskTypeOptions } = useGetTaskTypeOptions(translateText);

  const selectedOwner = toLookupOwner(getSelectedOwner(owners, values.ownerId));
  const selectedContactName =
    getSelectedContact(contacts, values.contactId)?.name ?? "";
  const selectedDealName = getSelectedDeal(deals, values.dealId)?.name ?? "";

  const [ownerSearchText, setOwnerSearchText] = useState("");
  const [contactSearchText, setContactSearchText] = useState("");
  const [dealSearchText, setDealSearchText] = useState("");

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
  const contactLookupParams: CrmContactLookupParams = {
    searchKeyword: debouncedContactSearchText,
    size: DEFAULT_LOOKUP_PAGE_SIZE,
    dealId: values.dealId,
    companyId: contactLookupCompanyId ?? undefined
  };

  const { data: contactLookupData } = useGetCrmContacts(
    contactLookupParams,
    isContactSearchEnabled
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

  const handleTypeSelect = (value: string) => {
    setFieldValue("typeId", Number(value));
  };

  const handleDueDateSelect = (date: Date | undefined) => {
    setFieldValue("dueAt", date?.toISOString());
  };

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    const owner = ownerLookupData?.items?.find(
      (ownerLookupItem) => String(ownerLookupItem.employeeId) === item.id
    );
    if (owner) setOwners(mergeOwners(owners, [fromLookupOwner(owner)]));
    setFieldValue("ownerId", owner?.employeeId);
    setOwnerSearchText("");
  };

  const handleContactSelect = (item: SearchableDropdownItem) => {
    setFieldValue("contactId", Number(item.id));
    setContactSearchText("");
  };

  const handleDealSelect = (item: SearchableDropdownItem) => {
    const deal = dealLookupData?.items?.find(
      (dealLookupItem) => String(dealLookupItem.id) === item.id
    );
    if (deal) {
      setDeals(
        mergeDeals(deals, [
          {
            id: deal.id,
            name: deal.name,
            contactId: deal.contactId ?? undefined
          }
        ])
      );
    }
    setFieldValue("dealId", Number(item.id));
    setDealSearchText("");

    if (deal?.contactId != null) {
      setFieldValue("contactId", deal.contactId);
      setContactSearchText("");
    }
  };

  const handleClearOwner = () => {
    setFieldValue("ownerId", undefined);
  };

  const handleClearContact = () => {
    setFieldValue("contactId", undefined);
    setContactSearchText("");
  };

  const handleClearDeal = () => {
    setFieldValue("dealId", undefined);
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
          onChange={handleChange}
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

export default TaskModalForm;
