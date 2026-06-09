import {
  AvatarChip,
  ButtonV2,
  CloseIcon,
  InputField
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { useMemo, useState, useEffect } from "react";

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
  useCreateNewContact,
  useGetCompanyLookup,
  useGetOwnerLookup
} from "~community/crm/api/ContactApi";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactAddFormTypes,
  CrmContactCreatePayload,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { addContactValidations } from "~community/crm/utils/contactValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

import SelectedOwnerField from "../SelectedOwnerField/SelectedOwnerField";

const AddContactModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateContactText = useTranslator(
    "crmModule",
    "contacts",
    "addContactModal"
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

  const { isCrmSalesManager } = useSessionData();
  const { data: currentUser } = useGetUserPersonalDetails();

  useEffect(() => {
    if (!currentUser) return;
    setSelectedOwner({
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? null,
      authPic: currentUser.authPic as string | null
    });
  }, [currentUser]);

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

  // If the user has Sales Manager Role, they should not be able to edit the owner field.
  const isOwnerReadonly = !isCrmSalesManager;

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
          id="add-contact-company"
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
        value={values.contactNumber || ""}
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
          id="owner-search"
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
          aria-label={translateContactText(["ariaLabels", "cancelAddContact"])}
        >
          {translateContactText(["buttons", "cancelAddContact"])}
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

export default AddContactModalContent;
