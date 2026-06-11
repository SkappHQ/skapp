import {
  AvatarChip,
  ButtonV2,
  CloseIcon,
  InputField
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { characterLengths } from "~community/common/constants/stringConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { concatStrings } from "~community/common/utils/commonUtil";
import {
  useEditContact,
  useGetCompanyLookup,
  useGetOwnerLookup
} from "~community/crm/api/ContactApi";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactEditFormTypes,
  CrmOwner,
  EditContactPayload
} from "~community/crm/types/CommonTypes";
import { addContactValidations } from "~community/crm/utils/contactValidations";

import SelectedOwnerField from "../SelectedOwnerField/SelectedOwnerField";

const EditContactModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateContactText = useTranslator(
    "crmModule",
    "contacts",
    "editContactModal"
  );

  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompanyLabel, setSelectedCompanyLabel] = useState("");

  const debouncedCompanySearch = useDebounce(
    companySearch.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const [ownerSearchText, setOwnerSearchText] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(null);

  const debouncedOwnerSearch = useDebounce(
    ownerSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const { setIsAddContactModalOpen, selectedContact } = useCrmStore(
    (store) => ({
      setIsAddContactModalOpen: store.setIsAddContactModalOpen,
      selectedContact: store.selectedContact
    })
  );

  useEffect(() => {
    if (!selectedContact) return;
    setSelectedOwner(selectedContact.owner);
    setSelectedCompanyLabel(selectedContact.company?.name ?? "");
  }, [selectedContact]);

  const { isCrmSalesManager } = useSessionData();

  // If the user has Sales Rep role, they should not be able to edit the owner field.
  const isOwnerReadonly = !isCrmSalesManager;

  const initialValues: CrmContactEditFormTypes = {
    name: selectedContact?.name ?? "",
    email: selectedContact?.email ?? "",
    contactNumber: selectedContact?.contactNumber ?? "",
    companyId: selectedContact?.company?.id ?? null,
    ownerId: selectedContact?.owner?.employeeId ?? null
  };

  const handleSuccess = () => {
    setSubmitting(false);
    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateContactText(["contactToastMessages", "successTitle"])
    });
  };

  const handleError = () => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateContactText(["contactToastMessages", "errorTitle"]),
      description: translateContactText([
        "contactToastMessages",
        "errorDescription"
      ])
    });
  };

  const handleCloseModal = (): void => {
    setIsAddContactModalOpen(false);
  };

  const { mutate: editContact, isPending } = useEditContact(
    handleSuccess,
    handleError
  );

  const submitEditContact = (values: CrmContactEditFormTypes) => {
    if (!selectedContact) return;

    const payload: EditContactPayload = {
      id: selectedContact.id,
      name: values.name.trim(),
      email: values.email.trim(),
      contactNumber: values.contactNumber?.trim() || undefined,
      companyId: values.companyId ?? undefined,
      ownerId: values.ownerId ?? undefined
    };

    editContact(payload);
  };

  const formik = useFormik({
    initialValues,
    onSubmit: submitEditContact,
    validationSchema: addContactValidations(translateContactText),
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true
  });

  const {
    values,
    errors,
    handleChange,
    setFieldValue,
    isSubmitting,
    setSubmitting,
    submitForm
  } = formik;

  const { data: companyLookupData, isFetching: isCompanyFetching } =
    useGetCompanyLookup(debouncedCompanySearch, DEFAULT_LOOKUP_PAGE_SIZE);

  const companyDropdownItems: SearchableDropdownItem[] =
    companyLookupData?.items?.map((company) => ({
      id: String(company.id),
      content: company.name
    })) ?? [];

  const handleCompanySelect = (companyDropDownItem: SearchableDropdownItem) => {
    const company = companyLookupData?.items?.find(
      (company) => String(company.id) === companyDropDownItem.id
    );
    setFieldValue("companyId", Number(companyDropDownItem.id));
    setSelectedCompanyLabel(
      company?.name ?? String(companyDropDownItem.content)
    );
    setCompanySearch("");
  };

  const handleClearCompany = () => {
    setFieldValue("companyId", null);
    setSelectedCompanyLabel("");
    setCompanySearch("");
  };

  const { data: ownerLookupData, isFetching: isOwnerFetching } =
    useGetOwnerLookup(
      debouncedOwnerSearch,
      DEFAULT_LOOKUP_PAGE_SIZE,
      !isOwnerReadonly
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
            src: owner.authPic ?? undefined,
            size: "sm"
          }}
          label={concatStrings([owner.firstName, owner.lastName ?? ""])}
        />
      )
    })) ?? [];

  const handleOwnerSelect = (ownerDropDownItem: SearchableDropdownItem) => {
    const owner = ownerLookupData?.items?.find(
      (owner) => String(owner.employeeId) === ownerDropDownItem.id
    );
    if (!owner) return;
    setFieldValue("ownerId", owner.employeeId);
    setSelectedOwner(owner);
    setOwnerSearchText("");
  };

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        value={values.name}
        errorMessage={errors.name}
        state={errors.name ? "error" : "default"}
        label={translateContactText(["labels", "name"])}
        placeholder={translateContactText(["placeholders", "name"])}
        onChange={handleChange}
        aria-label={translateContactText(["ariaLabels", "name"])}
        maxLength={characterLengths.NAME_LENGTH}
        required
        fullWidth
      />

      <InputField
        name="email"
        value={values.email}
        errorMessage={errors.email}
        state={errors.email ? "error" : "default"}
        label={translateContactText(["labels", "email"])}
        placeholder={translateContactText(["placeholders", "email"])}
        onChange={handleChange}
        aria-label={translateContactText(["ariaLabels", "email"])}
        required
        fullWidth
      />

      {values.companyId === null ? (
        <SearchableDropdown
          id="edit-contact-company"
          name="company"
          label={translateContactText(["labels", "company"])}
          placeholder={translateContactText(["placeholders", "company"])}
          items={companyDropdownItems}
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
          onSelect={handleCompanySelect}
          onClose={() => setCompanySearch("")}
          emptyMessage={
            isCompanyFetching ? undefined : (
              <p className="px-4 py-2 body2">
                {translateContactText(["emptyStates", "noCompanies"])}
              </p>
            )
          }
        />
      ) : (
        <InputField
          label={translateContactText(["labels", "company"])}
          value={selectedCompanyLabel}
          readOnly
          fullWidth
          variant="md"
          styleOverrides={{
            labelContainer:
              "h-6 inline-flex self-stretch pr-3 justify-start items-center gap-2"
          }}
          customStyles={{ gap: "gap-2" }}
          aria-label={translateContactText(["ariaLabels", "company"])}
          rightIcon={
            <ButtonV2
              variant="tertiary"
              type="button"
              onClick={handleClearCompany}
              aria-label={translateContactText(["ariaLabels", "clearCompany"])}
              icon={<CloseIcon />}
            />
          }
        />
      )}

      <InputField
        name="contactNumber"
        value={values.contactNumber}
        errorMessage={errors.contactNumber}
        state={errors.contactNumber ? "error" : "default"}
        label={translateContactText(["labels", "contactNumber"])}
        placeholder={translateContactText(["placeholders", "contactNumber"])}
        onChange={handleChange}
        aria-label={translateContactText(["ariaLabels", "contactNumber"])}
        maxLength={characterLengths.PHONE_NUMBER_LENGTH_MAX}
        fullWidth
      />

      {selectedOwner ? (
        <SelectedOwnerField
          label={translateContactText(["labels", "owner"])}
          owner={selectedOwner}
          onRemove={() => {
            setSelectedOwner(null);
            setFieldValue("ownerId", null);
          }}
          showRemoveButton={!isOwnerReadonly}
          ariaLabel={translateContactText(["ariaLabels", "clearOwner"])}
        />
      ) : (
        <SearchableDropdown
          id="edit-contact-owner-search"
          items={ownerDropdownItems}
          onSelect={handleOwnerSelect}
          label={translateContactText(["labels", "owner"])}
          placeholder={translateContactText(["placeholders", "owner"])}
          value={ownerSearchText}
          onChange={(e) => setOwnerSearchText(e.target.value)}
          state={errors.ownerId ? "error" : "default"}
          errorMessage={errors.ownerId}
          emptyMessage={
            isOwnerFetching ? undefined : (
              <p className="px-4 py-2 body2">
                {translateContactText(["emptyStates", "noOwners"])}
              </p>
            )
          }
        />
      )}

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isPending}
          onClick={handleCloseModal}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateContactText(["ariaLabels", "cancelEditContact"])}
        >
          {translateContactText(["buttons", "cancelEditContact"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={() => submitForm()}
          disabled={isPending}
          isLoading={isPending}
          aria-label={translateContactText(["ariaLabels", "save"])}
        >
          {translateContactText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default EditContactModalContent;
