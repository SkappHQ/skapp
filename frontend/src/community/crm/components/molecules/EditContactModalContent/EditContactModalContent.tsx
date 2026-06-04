import {
  AvatarChip,
  ButtonV2,
  CloseIcon,
  InputField
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { useEffect, useMemo, useRef, useState } from "react";

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
  useCheckContactEmailExists,
  useEditContact,
  useGetCompanyLookup,
  useGetOwnerLookup
} from "~community/crm/api/ContactApi";
import {
  CONTACT_EMAIL_DEBOUNCE_DELAY,
  CONTACT_SEARCH_DEBOUNCE_DELAY,
  DEFAULT_LOOKUP_PAGE_SIZE
} from "~community/crm/constants/contactConstants";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactEditFormTypes,
  CrmContactEditPayload,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { editContactValidations } from "~community/crm/utils/contactValidations";
import { toOwnerAvatarProps } from "~community/crm/utils/crmUtil";

const EditContactModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "editContactModal"
  );
  const translateToasts = useTranslator(
    "crmModule",
    "contacts",
    "editContactToastMessages"
  );

  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompanyLabel, setSelectedCompanyLabel] = useState("");
  const debouncedCompanySearch = useDebounce(
    companySearch.trim(),
    CONTACT_SEARCH_DEBOUNCE_DELAY
  );

  const { isCrmSalesManager } = useSessionData();

  const isOwnerReadonly = !isCrmSalesManager;

  const [ownerSearch, setOwnerSearch] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(null);
  const debouncedOwnerSearch = useDebounce(
    ownerSearch.trim(),
    CONTACT_SEARCH_DEBOUNCE_DELAY
  );

  const { setIsContactModalOpen, selectedContact, setSelectedContact } =
    useCrmStore((store) => ({
      setIsContactModalOpen: store.setIsContactModalOpen,
      selectedContact: store.selectedContact,
      setSelectedContact: store.setSelectedContact
    }));

  const initialValues: CrmContactEditFormTypes = useMemo(
    () => ({
      name: selectedContact?.name || "",
      email: selectedContact?.email || "",
      contactNumber: selectedContact?.contactNumber || null,
      companyId: selectedContact?.company?.id || null,
      ownerId: selectedContact?.owner?.employeeId || null
    }),
    [selectedContact]
  );

  const handleSuccess = () => {
    setSubmitting(false);
    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateToasts(["successTitle"])
    });
  };

  const handleError = () => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateToasts(["errorTitle"]),
      description: translateToasts(["errorDescription"])
    });
  };

  const handleCloseModal = (): void => {
    setIsContactModalOpen(false);
    setSelectedContact(null);
  };

  const { mutate: editContact, isPending } = useEditContact(
    handleSuccess,
    handleError
  );

  const submitEditContact = (values: CrmContactEditFormTypes) => {
    if (!selectedContact) return;

    const payload: CrmContactEditPayload = {
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
    validationSchema: editContactValidations(translateText),
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true
  });

  const {
    values,
    errors,
    handleChange,
    setFieldValue,
    setSubmitting,
    submitForm
  } = formik;

  const debouncedEmail = useDebounce(
    values.email.trim(),
    CONTACT_EMAIL_DEBOUNCE_DELAY
  );

  const { data: checkedEmailExists } = useCheckContactEmailExists(
    debouncedEmail,
    debouncedEmail.length > 0 &&
      debouncedEmail !== selectedContact?.email?.trim()
  );

  const isEmailUnchanged =
    values.email.trim() === selectedContact?.email?.trim();

  const hasEmailConflict =
    !isEmailUnchanged && checkedEmailExists?.isExists === true;

  const emailError = hasEmailConflict
    ? translateText(["validations", "emailExists"])
    : errors.email;

  const lastSelectedOwnerRef = useRef<CrmOwner | null>(null);

  useEffect(() => {
    if (selectedContact?.owner) {
      setSelectedOwner(selectedContact.owner);
      lastSelectedOwnerRef.current = selectedContact.owner;
    }
    if (selectedContact?.company) {
      setSelectedCompanyLabel(selectedContact.company.name);
    }
  }, [selectedContact]);

  const { data: companyLookupData, isFetching: isCompanyFetching } =
    useGetCompanyLookup(debouncedCompanySearch, DEFAULT_LOOKUP_PAGE_SIZE);

  const { data: ownerLookupData, isFetching: isOwnerFetching } =
    useGetOwnerLookup(
      debouncedOwnerSearch,
      DEFAULT_LOOKUP_PAGE_SIZE,
      !isOwnerReadonly
    );

  const companyDropdownItems: SearchableDropdownItem[] =
    companyLookupData?.items?.map((company) => ({
      id: String(company.id),
      content: company.name
    })) ?? [];

  const ownerDropdownItems: SearchableDropdownItem[] =
    ownerLookupData?.items?.map((owner) => ({
      id: String(owner.employeeId),
      content: (
        <AvatarChip
          avatarProps={{ ...toOwnerAvatarProps(owner), size: "sm" }}
          label={concatStrings([owner.firstName, owner.lastName ?? ""])}
        />
      )
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

  const SearchableDropdownEmptyMessage = (message: string) => (
    <p className="px-4 py-2 body2">{message}</p>
  );

  const handleOwnerSelect = (ownerDropDownItem: SearchableDropdownItem) => {
    const owner = ownerLookupData?.items?.find(
      (owner) => String(owner.employeeId) === ownerDropDownItem.id
    );
    if (!owner) return;
    setFieldValue("ownerId", owner.employeeId);
    setSelectedOwner(owner);
    lastSelectedOwnerRef.current = owner;
    setOwnerSearch("");
  };

  const handleClearOwner = () => {
    setFieldValue("ownerId", null);
    setSelectedOwner(null);
    setOwnerSearch("");
  };

  const restoreLastOwnerIfEmpty = () => {
    if (selectedOwner || !lastSelectedOwnerRef.current) return;
    setSelectedOwner(lastSelectedOwnerRef.current);
    setFieldValue("ownerId", lastSelectedOwnerRef.current.employeeId);
    setOwnerSearch("");
  };

  const isSubmitDisabled = !selectedContact || isPending || hasEmailConflict;

  const renderSelectedOwnerDisplay = () => (
    <div className="flex w-full flex-col gap-2">
      <span className="subtitle1 leading-normal inline-flex h-6 items-center">
        {translateText(["labels", "owner"])}
      </span>
      <div className="flex h-[3.125rem] items-center rounded-lg bg-gray-100 px-3">
        <AvatarChip
          label={concatStrings([
            selectedOwner!.firstName,
            selectedOwner!.lastName ?? ""
          ])}
          avatarProps={{ ...toOwnerAvatarProps(selectedOwner!), size: "sm" }}
          showActionButton={!isOwnerReadonly}
          onActionClick={isOwnerReadonly ? undefined : handleClearOwner}
          actionIcon={isOwnerReadonly ? undefined : <CloseIcon />}
          actionButtonAriaLabel={translateText(["ariaLabels", "clearOwner"])}
        />
      </div>
    </div>
  );

  const renderOwnerDropdown = () => (
    <SearchableDropdown
      id="edit-contact-owner"
      name="owner"
      label={translateText(["labels", "owner"])}
      placeholder={translateText(["placeholders", "owner"])}
      items={ownerDropdownItems}
      value={ownerSearch}
      onChange={(e) => setOwnerSearch(e.target.value)}
      onSelect={handleOwnerSelect}
      onClose={() => {
        setOwnerSearch("");
        restoreLastOwnerIfEmpty();
      }}
      emptyMessage={
        isOwnerFetching
          ? undefined
          : SearchableDropdownEmptyMessage(
              translateText(["emptyStates", "noOwners"])
            )
      }
    />
  );

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        value={values.name}
        errorMessage={errors.name}
        state={errors.name ? "error" : "default"}
        label={translateText(["labels", "name"])}
        placeholder={translateText(["placeholders", "name"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "name"])}
        maxLength={characterLengths.NAME_LENGTH}
        required
        fullWidth
      />

      <InputField
        name="email"
        value={values.email}
        errorMessage={emailError}
        state={emailError ? "error" : "default"}
        label={translateText(["labels", "email"])}
        placeholder={translateText(["placeholders", "email"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "email"])}
        required
        fullWidth
      />

      {values.companyId === null ? (
        <SearchableDropdown
          id="edit-contact-company"
          name="company"
          label={translateText(["labels", "company"])}
          placeholder={translateText(["placeholders", "company"])}
          items={companyDropdownItems}
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
          onSelect={handleCompanySelect}
          onClose={() => setCompanySearch("")}
          emptyMessage={
            isCompanyFetching
              ? undefined
              : SearchableDropdownEmptyMessage(
                  translateText(["emptyStates", "noCompanies"])
                )
          }
        />
      ) : (
        <InputField
          label={translateText(["labels", "company"])}
          value={selectedCompanyLabel}
          readOnly
          fullWidth
          variant="md"
          styleOverrides={{
            labelContainer:
              "h-6 inline-flex self-stretch pr-3 justify-start items-center gap-2"
          }}
          customStyles={{ gap: "gap-2" }}
          aria-label={translateText(["ariaLabels", "company"])}
          rightIcon={
            <ButtonV2
              variant="tertiary"
              type="button"
              onClick={handleClearCompany}
              aria-label={translateText(["ariaLabels", "clearCompany"])}
              icon={<CloseIcon />}
            />
          }
        />
      )}

      <InputField
        name="contactNumber"
        value={values.contactNumber || ""}
        errorMessage={errors.contactNumber || ""}
        state={errors.contactNumber ? "error" : "default"}
        label={translateText(["labels", "contactNumber"])}
        placeholder={translateText(["placeholders", "contactNumber"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "contactNumber"])}
        maxLength={characterLengths.PHONE_NUMBER_LENGTH_MAX}
        fullWidth
      />

      {selectedOwner
        ? renderSelectedOwnerDisplay()
        : !isOwnerReadonly && renderOwnerDropdown()}

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isPending}
          onClick={handleCloseModal}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["ariaLabels", "cancelEditContact"])}
        >
          {translateText(["buttons", "cancelEditContact"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={() => submitForm()}
          disabled={isSubmitDisabled}
          isLoading={isPending}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default EditContactModalContent;
