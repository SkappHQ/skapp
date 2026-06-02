import {
  AvatarChip,
  ButtonV2,
  CloseIcon,
  InputField
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { characterLengths } from "~community/common/constants/stringConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { concatStrings } from "~community/common/utils/commonUtil";
import {
  useCreateNewContact,
  useGetCompanyLookup,
  useGetOwnerLookup
} from "~community/crm/api/ContactApi";
import { CONTACT_SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/contactConstants";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactAddFormTypes,
  CrmContactCreatePayload
} from "~community/crm/types/CommonTypes";
import { addContactValidations } from "~community/crm/utils/contactValidations";

const AddContactModal: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "addContactModal"
  );

  const translateToasts = useTranslator(
    "crmModule",
    "contacts",
    "contactToastMessages"
  );

  const { setIsAddContactModalOpen } = useCrmStore((store) => ({
    setIsAddContactModalOpen: store.setIsAddContactModalOpen
  }));

  const initialValues: CrmContactAddFormTypes = {
    name: "",
    email: "",
    contactNumber: null,
    companyId: null,
    ownerId: null
  };

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
    setIsAddContactModalOpen(false);
  };

  const { mutate: createNewContact, isPending } = useCreateNewContact(
    handleSuccess,
    handleError
  );

  const createContact = (values: CrmContactAddFormTypes) => {
    const payload: CrmContactCreatePayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      contactNumber: values.contactNumber?.trim() || undefined,
      companyId: values.companyId ?? undefined,
      ownerId: values.ownerId ?? undefined
    };

    createNewContact(payload);
  };

  const formik = useFormik({
    initialValues,
    onSubmit: createContact,
    validationSchema: addContactValidations(translateText),
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
    submitForm
  } = formik;

  // --- Company searchable dropdown ---
  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompanyLabel, setSelectedCompanyLabel] = useState("");
  const debouncedCompanySearch = useDebounce(
    companySearch.trim(),
    CONTACT_SEARCH_DEBOUNCE_DELAY
  );
  const { data: companyLookup, isLoading: isCompanyLoading } =
    useGetCompanyLookup(
      debouncedCompanySearch,
      debouncedCompanySearch.length > 0
    );

  const companyItems: SearchableDropdownItem[] = (
    companyLookup?.items ?? []
  ).map((company) => ({
    id: String(company.id),
    content: company.name
  }));

  const handleCompanySelect = (item: SearchableDropdownItem) => {
    setFieldValue("companyId", Number(item.id));
    setSelectedCompanyLabel(String(item.content));
    setCompanySearch("");
  };

  const handleClearCompany = () => {
    setFieldValue("companyId", null);
    setSelectedCompanyLabel("");
    setCompanySearch("");
  };

  const [ownerSearch, setOwnerSearch] = useState("");
  const [selectedOwnerLabel, setSelectedOwnerLabel] = useState("");
  const debouncedOwnerSearch = useDebounce(
    ownerSearch.trim(),
    CONTACT_SEARCH_DEBOUNCE_DELAY
  );
  const { data: ownerLookup, isLoading: isOwnerLoading } = useGetOwnerLookup(
    debouncedOwnerSearch,
    debouncedOwnerSearch.length > 0
  );

  const ownerItems: SearchableDropdownItem[] = (ownerLookup?.items ?? []).map(
    (owner) => ({
      id: String(owner.employeeId),
      content: (
        <AvatarChip
          avatarProps={{
            id: String(owner.employeeId),
            firstName: owner.firstName,
            lastName: owner.lastName ?? "",
            src: owner.authPic ?? undefined,
            size: "sm"
          }}
          label={concatStrings([owner.firstName, owner.lastName ?? ""]).trim()}
        />
      )
    })
  );

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    const owner = ownerLookup?.items.find(
      (o) => String(o.employeeId) === item.id
    );
    setFieldValue("ownerId", Number(item.id));
    setSelectedOwnerLabel(
      owner
        ? concatStrings([owner.firstName, owner.lastName ?? ""]).trim()
        : item.id
    );
    setOwnerSearch("");
  };

  const handleClearOwner = () => {
    setFieldValue("ownerId", null);
    setSelectedOwnerLabel("");
    setOwnerSearch("");
  };

  const renderClearButton = (onClear: () => void, ariaLabel: string) => (
    <button
      type="button"
      onClick={onClear}
      aria-label={ariaLabel}
      className="flex items-center justify-center cursor-pointer"
    >
      <CloseIcon className="w-4 h-4" />
    </button>
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
        errorMessage={errors.email}
        state={errors.email ? "error" : "default"}
        label={translateText(["labels", "email"])}
        placeholder={translateText(["placeholders", "email"])}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "email"])}
        required
        fullWidth
      />

      {values.companyId === null ? (
        <SearchableDropdown
          id="add-contact-company"
          name="company"
          label={translateText(["labels", "company"])}
          placeholder={translateText(["placeholders", "company"])}
          items={companyItems}
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
          onSelect={handleCompanySelect}
          onClose={() => setCompanySearch("")}
          emptyMessage={
            isCompanyLoading ? undefined : (
              <p className="px-4 py-2 body2">
                {translateText(["emptyStates", "noCompanies"])}
              </p>
            )
          }
        />
      ) : (
        <InputField
          label={translateText(["labels", "company"])}
          value={selectedCompanyLabel}
          readOnly
          fullWidth
          aria-label={translateText(["ariaLabels", "company"])}
          rightIcon={renderClearButton(
            handleClearCompany,
            translateText(["ariaLabels", "clearCompany"])
          )}
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
        fullWidth
      />

      {values.ownerId === null ? (
        <SearchableDropdown
          id="add-contact-owner"
          name="owner"
          label={translateText(["labels", "owner"])}
          placeholder={translateText(["placeholders", "owner"])}
          items={ownerItems}
          value={ownerSearch}
          onChange={(e) => setOwnerSearch(e.target.value)}
          onSelect={handleOwnerSelect}
          onClose={() => setOwnerSearch("")}
          emptyMessage={
            isOwnerLoading ? undefined : (
              <p className="px-4 py-2 body2">
                {translateText(["emptyStates", "noOwners"])}
              </p>
            )
          }
        />
      ) : (
        <InputField
          label={translateText(["labels", "owner"])}
          value={selectedOwnerLabel}
          readOnly
          fullWidth
          aria-label={translateText(["ariaLabels", "owner"])}
          rightIcon={renderClearButton(
            handleClearOwner,
            translateText(["ariaLabels", "clearOwner"])
          )}
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
          aria-label={translateText(["ariaLabels", "cancelAddContact"])}
        >
          {translateText(["buttons", "cancelAddContact"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={() => submitForm()}
          disabled={isPending}
          isLoading={isPending}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default AddContactModal;
