import {
  AvatarChip,
  ButtonV2,
  CloseIcon,
  InputField,
  PlusIcon
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
  useCreateNewContact,
  useGetCompanyLookup,
  useGetOwnerLookup
} from "~community/crm/api/ContactApi";
import {
  CONTACT_SEARCH_DEBOUNCE_DELAY,
  DEFAULT_LOOKUP_PAGE_SIZE
} from "~community/crm/constants/contactConstants";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactAddFormTypes,
  CrmContactCreatePayload,
  CrmOwnerType
} from "~community/crm/types/CommonTypes";
import { addContactValidations } from "~community/crm/utils/contactValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

const getOwnerFullName = (owner: CrmOwnerType): string =>
  concatStrings([owner.firstName, owner.lastName ?? ""]);

const toOwnerAvatarProps = (owner: CrmOwnerType) => ({
  id: String(owner.employeeId),
  firstName: owner.firstName,
  lastName: owner.lastName ?? "",
  src: owner.authPic ?? undefined,
  size: "sm" as const
});

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
      title: translateToasts(["successTitle"]),
      description: translateToasts(["successDescription"])
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
    setFieldValue,
    setSubmitting,
    submitForm
  } = formik;

  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompanyLabel, setSelectedCompanyLabel] = useState("");
  const debouncedCompanySearch = useDebounce(
    companySearch.trim(),
    CONTACT_SEARCH_DEBOUNCE_DELAY
  );

  const { isCrmSalesManager } = useSessionData();
  const { data: currentUser } = useGetUserPersonalDetails();

  const isOwnerReadonly = !isCrmSalesManager;

  const [ownerSearch, setOwnerSearch] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<CrmOwnerType | null>(null);
  const debouncedOwnerSearch = useDebounce(
    ownerSearch.trim(),
    CONTACT_SEARCH_DEBOUNCE_DELAY
  );

  const currentUserAsOwner = useMemo<CrmOwnerType>(() => {
    return {
      employeeId: Number(currentUser?.employeeId),
      firstName: currentUser?.firstName ?? "",
      lastName: currentUser?.lastName ?? null,
      authPic: currentUser?.authPic as string | null
    };
  }, [currentUser]);

  const hasSetDefaultOwnerAsCurrentUser = useRef(false);

  useEffect(() => {
    if (currentUserAsOwner && !hasSetDefaultOwnerAsCurrentUser.current) {
      hasSetDefaultOwnerAsCurrentUser.current = true;
      setSelectedOwner(currentUserAsOwner);
      setFieldValue("ownerId", currentUserAsOwner.employeeId);
    }
  }, [currentUserAsOwner, setFieldValue]);

  const { data: companyLookup, isFetching: isCompanyFetching } =
    useGetCompanyLookup(debouncedCompanySearch, DEFAULT_LOOKUP_PAGE_SIZE);

  const { data: ownerLookup, isFetching: isOwnerFetching } = useGetOwnerLookup(
    debouncedOwnerSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    !isOwnerReadonly
  );

  const companyItems: SearchableDropdownItem[] =
    companyLookup?.items?.map((company) => ({
      id: String(company.id),
      content: company.name
    })) ?? [];

  const ownerItems: SearchableDropdownItem[] =
    ownerLookup?.items?.map((owner) => ({
      id: String(owner.employeeId),
      content: (
        <AvatarChip
          avatarProps={toOwnerAvatarProps(owner)}
          label={getOwnerFullName(owner)}
        />
      )
    })) ?? [];

  const handleCompanySelect = (item: SearchableDropdownItem) => {
    const company = companyLookup?.items?.find((c) => String(c.id) === item.id);
    setFieldValue("companyId", Number(item.id));
    setSelectedCompanyLabel(company?.name ?? String(item.content));
    setCompanySearch("");
  };

  const handleClearCompany = () => {
    setFieldValue("companyId", null);
    setSelectedCompanyLabel("");
    setCompanySearch("");
  };

  const handleAddCompany = () => {
    // TODO: open the add-company flow.
  };

  const companyEmptyMessage = (
    <div>
      <p className="px-4 py-3 body2 text-secondary-text">
        {translateText(["emptyStates", "noCompanies"])}
      </p>
      <ButtonV2
        type="button"
        onClick={handleAddCompany}
        aria-label={translateText(["ariaLabels", "addCompany"])}
        icon={<PlusIcon />}
        iconPosition="start"
        className="justify-start w-full px-4 py-2 bg-primary-background text-primary-text"
      >
        {translateText(["buttons", "addCompany"])}
      </ButtonV2>
    </div>
  );

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    const owner = ownerLookup?.items?.find(
      (o) => String(o.employeeId) === item.id
    );
    if (!owner) return;
    setFieldValue("ownerId", owner.employeeId);
    setSelectedOwner(owner);
    setOwnerSearch("");
  };

  const handleClearOwner = () => {
    setFieldValue("ownerId", null);
    setSelectedOwner(null);
    setOwnerSearch("");
  };

  const renderClearButton = (onClear: () => void, ariaLabel: string) => (
    <ButtonV2 variant="tertiary" type="button" onClick={onClear} aria-label={ariaLabel}>
      <CloseIcon />
    </ButtonV2>
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
          onEmptyActivate={handleAddCompany}
          emptyMessage={isCompanyFetching ? undefined : companyEmptyMessage}
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
        maxLength={characterLengths.PHONE_NUMBER_LENGTH_MAX}
        fullWidth
      />

      {selectedOwner ? (
        <div className="flex w-full flex-col gap-2">
          <span className="subtitle1 leading-normal inline-flex h-6 items-center">
            {translateText(["labels", "owner"])}
          </span>
          <div className="flex h-[3.125rem] items-center rounded-lg bg-gray-100 px-3">
            <AvatarChip
              label={getOwnerFullName(selectedOwner)}
              avatarProps={toOwnerAvatarProps(selectedOwner)}
              showActionButton={!isOwnerReadonly}
              onActionClick={isOwnerReadonly ? undefined : handleClearOwner}
              actionIcon={isOwnerReadonly ? undefined : <CloseIcon />}
              actionButtonAriaLabel={translateText([
                "ariaLabels",
                "clearOwner"
              ])}
            />
          </div>
        </div>
      ) : isOwnerReadonly ? null : (
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
            isOwnerFetching ? undefined : (
              <p className="px-4 py-2 body2">
                {translateText(["emptyStates", "noOwners"])}
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
