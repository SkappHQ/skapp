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
import { useShallow } from "zustand/react/shallow";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  useGetContactLookup,
  useGetOwnerLookup
} from "~community/crm/v2/api/ContactApi";
import { useGetDealLookup } from "~community/crm/v2/api/DealApi";
import OwnerDropdownItem from "~community/crm/v2/components/atoms/OwnerDropdownItem/OwnerDropdownItem";
import SelectableSearchField from "~community/crm/v2/components/molecules/SelectableSearchField/SelectableSearchField";
import SelectedOwnerField from "~community/crm/v2/components/molecules/SelectedOwnerField/SelectedOwnerField";
import { DEFAULT_LOOKUP_PAGE_SIZE } from "~community/crm/v2/constants/commonConstants";
import { useGetPriorityOptions } from "~community/crm/v2/hooks/useGetPriorityOptions";
import useGetTaskTypeOptions from "~community/crm/v2/hooks/useGetTaskTypeOptions";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmContactFilterRequest,
  CrmDealFilterRequest,
  CrmOwnerLookupFilterRequest,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";
import { getOwnerById } from "~community/crm/v2/utils/commonUtil";
import {
  getContactDisplayName,
  getContactNameById,
  mergeContacts
} from "~community/crm/v2/utils/contactUtil";
import { getDealNameById, mergeDeals } from "~community/crm/v2/utils/dealUtil";
import { parseDueDate } from "~community/crm/v2/utils/taskUtil";

interface TaskModalFormProps {
  formik: FormikProps<CrmTaskEntity>;
  isPending: boolean;
  translateText: TranslatorFunctionType;
}

const TaskModalForm: FC<TaskModalFormProps> = ({
  formik,
  isPending,
  translateText
}) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    dirty,
    isSubmitting,
    setFieldValue,
    setFieldError,
    submitForm
  } = formik;

  const { isCrmSalesManager } = useSessionData();

  const {
    owners,
    contacts,
    deals,
    selectedCompanyId,
    isCrmSidePanelOpen,
    crmSidePanelType,
    setContacts,
    setDeals,
    setIsTaskModalOpen
  } = useCrmStoreV2(
    useShallow((store) => ({
      owners: store.owners,
      contacts: store.contacts,
      deals: store.deals,
      selectedCompanyId: store.selectedCompanyId,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      setContacts: store.setContacts,
      setDeals: store.setDeals,
      setIsTaskModalOpen: store.setIsTaskModalOpen
    }))
  );

  const priorityDropdownOptions = useGetPriorityOptions();
  const taskTypeOptions = useGetTaskTypeOptions(translateText);

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

  const isCompanySidePanelOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.COMPANY_SIDE_PANEL &&
    selectedCompanyId !== null;

  const companyScopeId = isCompanySidePanelOpen ? selectedCompanyId : undefined;

  const hasSelectedContact = values.contactId !== undefined;
  const hasSelectedDeal = values.dealId !== undefined;

  const ownerFilters: CrmOwnerLookupFilterRequest = {
    searchKeyword: debouncedOwnerSearchText,
    size: DEFAULT_LOOKUP_PAGE_SIZE
  };

  const contactFilters: CrmContactFilterRequest = {
    searchKeyword: debouncedContactSearchText,
    size: DEFAULT_LOOKUP_PAGE_SIZE,
    dealId: values.dealId,
    companyId: hasSelectedDeal ? undefined : companyScopeId
  };

  const dealFilters: CrmDealFilterRequest = {
    searchKeyword: debouncedDealSearchText,
    size: DEFAULT_LOOKUP_PAGE_SIZE,
    contactId: values.contactId,
    companyId: hasSelectedContact ? undefined : companyScopeId
  };

  const isContactSearchEnabled =
    debouncedContactSearchText.length > 0 ||
    hasSelectedDeal ||
    contactFilters.companyId !== undefined;

  const isDealSearchEnabled =
    debouncedDealSearchText.length > 0 ||
    hasSelectedContact ||
    dealFilters.companyId !== undefined;

  const { data: ownerLookupData } = useGetOwnerLookup(
    ownerFilters,
    Boolean(isCrmSalesManager) && debouncedOwnerSearchText.length > 0
  );
  const { data: contactLookupData } = useGetContactLookup(
    contactFilters,
    isContactSearchEnabled
  );
  const { data: dealLookupData } = useGetDealLookup(
    dealFilters,
    isDealSearchEnabled
  );

  useEffect(() => {
    if (!contactLookupData) return;
    setContacts(mergeContacts(contacts, contactLookupData.items));
  }, [contactLookupData]);

  useEffect(() => {
    if (!dealLookupData) return;
    setDeals(mergeDeals(deals, dealLookupData.items));
  }, [dealLookupData]);

  const selectedOwner = getOwnerById(owners, values.ownerId);
  const selectedContactName = getContactNameById(contacts, values.contactId);
  const selectedDealName = getDealNameById(deals, values.dealId);

  const ownerDropdownItems: SearchableDropdownItem[] = useMemo(() => {
    if (ownerLookupData) {
      return ownerLookupData.items.map((owner) => ({
        id: String(owner.employeeId),
        content: <OwnerDropdownItem owner={owner} />
      }));
    }
    return [];
  }, [ownerLookupData]);

  const contactDropdownItems: SearchableDropdownItem[] = useMemo(() => {
    if (contactLookupData) {
      return contactLookupData.items.map((contact) => ({
        id: String(contact.id),
        content: (
          <div
            className="w-full truncate"
            title={getContactDisplayName(contact)}
          >
            {getContactDisplayName(contact)}
          </div>
        )
      }));
    }
    return [];
  }, [contactLookupData]);

  const dealDropdownItems: SearchableDropdownItem[] = useMemo(() => {
    if (dealLookupData) {
      return dealLookupData.items.map((deal) => ({
        id: String(deal.id),
        content: (
          <div className="w-full truncate" title={deal.name}>
            {deal.name}
          </div>
        )
      }));
    }
    return [];
  }, [dealLookupData]);

  const clearError = (field: keyof CrmTaskEntity) =>
    setFieldError(field, undefined);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event);
    clearError("name");
  };

  const handleNotesChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(event);
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
    setFieldValue("ownerId", Number(item.id));
    clearError("ownerId");
    setOwnerSearchText("");
  };

  const handleContactSelect = (item: SearchableDropdownItem) => {
    setFieldValue("contactId", Number(item.id));
    setContactSearchText("");
  };

  const handleDealSelect = (item: SearchableDropdownItem) => {
    const dealId = Number(item.id);
    setFieldValue("dealId", dealId);
    setDealSearchText("");

    const dealContactId = deals[dealId]?.contactId;
    if (dealContactId !== undefined) {
      setFieldValue("contactId", dealContactId);
      setContactSearchText("");
    }
  };

  const handleClearOwner = () => setFieldValue("ownerId", undefined);

  const handleClearContact = () => {
    setFieldValue("contactId", undefined);
    setContactSearchText("");
  };

  const handleClearDeal = () => {
    setFieldValue("dealId", undefined);
    setDealSearchText("");
  };

  const hasFormErrors = Object.keys(errors).length > 0;

  const dueDate = parseDueDate(values.dueAt);

  return (
    <div className="flex flex-col w-full h-full justify-between gap-[0.625rem] max-h-[78vh]">
      <div className="flex flex-col gap-[0.625rem] overflow-y-auto pr-1">
        <InputField
          name="name"
          value={values.name}
          errorMessage={touched.name ? errors.name : undefined}
          state={touched.name && errors.name ? "error" : "default"}
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
              errorMessage={touched.typeId ? errors.typeId : undefined}
              variant={
                touched.typeId && errors.typeId ? "primary-error" : "primary"
              }
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
              errorMessage={touched.priority ? errors.priority : undefined}
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
              selected={dueDate}
              onSelect={handleDueDateSelect}
              popperProps={{ position: "bottom-start", isFlip: true }}
            >
              <div>
                <InputField
                  name="dueAt"
                  value={dueDate?.toLocaleDateString()}
                  label={translateText(["labels", "dueDate"])}
                  placeholder={translateText(["placeholders", "dueDate"])}
                  state={touched.dueAt && errors.dueAt ? "error" : "default"}
                  errorMessage={touched.dueAt ? errors.dueAt : undefined}
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
                value={ownerSearchText}
                onChange={(event) => setOwnerSearchText(event.target.value)}
                state={touched.ownerId && errors.ownerId ? "error" : "default"}
                errorMessage={touched.ownerId ? errors.ownerId : undefined}
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
          onSearchChange={(event) => setContactSearchText(event.target.value)}
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
          onSearchChange={(event) => setDealSearchText(event.target.value)}
          items={dealDropdownItems}
          onSelect={handleDealSelect}
          emptyMessage={translateText(["emptyStates", "noDeals"])}
          isOpenOnFocus={isDealSearchEnabled}
        />

        <TextArea
          name="notes"
          value={values.notes}
          placeholder={translateText(["placeholders", "notes"])}
          label={translateText(["labels", "notes"])}
          errorMessage={touched.notes ? errors.notes : undefined}
          state={touched.notes && errors.notes ? "error" : "default"}
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
          onClick={() => setIsTaskModalOpen(false)}
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
          disabled={isSubmitting || isPending || !dirty || hasFormErrors}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default TaskModalForm;
