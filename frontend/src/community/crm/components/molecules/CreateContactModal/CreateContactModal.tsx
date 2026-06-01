import {
  AvatarChip,
  ButtonV2,
  CloseIcon,
  InputField,
  PlusIcon,
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import * as Yup from "yup";

import SearchableDropdown from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";

import { characterLengths } from "~community/common/constants/stringConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { isValidPhoneNumber } from "~community/common/regex/regexPatterns";
import {
  useCreateContact,
  useGetCrmCompanies,
  useGetCrmOwners
} from "~community/crm/api/ContactsApi";
import { useCrmStore } from "~community/crm/store/store";
import {
  ContactOwnerLookup,
  CreateContactPayload
} from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";
import { ownerFullName as getFullName } from "~community/crm/utils/contactTableHelpers";
import { DEFAULT_PAGE_SIZE } from "~community/crm/constants/contactConstants";
const ADD_COMPANY_ID = "__add_company__";

type DropdownItem = { id: string; content: ReactNode };

interface CreateContactFormValues {
  name: string;
  email: string;
  company: string;
  companyId: number | null;
  contactNumber: string;
  ownerId: number | null;
}

const toAvatarProps = (owner: ContactOwnerLookup) => ({
  id: String(owner.employeeId),
  src: owner.authPic ?? undefined,
  firstName: owner.firstName,
  lastName: owner.lastName ?? "",
  size: "sm"
});

const toOwnerLookup = (source: {
  employeeId: number;
  firstName?: string | null;
  lastName?: string | null;
  authPic?: string | null;
}): ContactOwnerLookup => ({
  employeeId: source.employeeId,
  firstName: source.firstName ?? "",
  lastName: source.lastName ?? "",
  authPic: source.authPic ?? null
});

const CreateContactModal = () => {
  const { setToastMessage } = useToast();
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "createContactModal"
  );
  const { setIsAddContactModalOpen, setCrmModalType } = useCrmStore(
    (state) => state
  );
  const {
    isCrmSalesManager
  } = useSessionData();
  const { data: me } = useGetUserPersonalDetails();
  const { data: companiesData } = useGetCrmCompanies({ page: 0, size: DEFAULT_PAGE_SIZE });
  const { data: ownersData } = useGetCrmOwners({ page: 0, size: DEFAULT_PAGE_SIZE });

  const [selectedOwner, setSelectedOwner] = useState<ContactOwnerLookup | null>(null);
  const [previousOwner, setPreviousOwner] = useState<ContactOwnerLookup | null>(null);
  const [ownerSearch, setOwnerSearch] = useState("");
  const ownerSectionRef = useRef<HTMLDivElement>(null);

  const isOwnerReadonly = !isCrmSalesManager

  const defaultOwner = useMemo<ContactOwnerLookup | null>(() => {
    if (!me?.employeeId) return null;
    return toOwnerLookup({
      employeeId: Number(me.employeeId),
      firstName: me.firstName,
      lastName: me.lastName,
      authPic: me.authPic as string | null
    });
  }, [me]);

  const companyOptions = useMemo(
    () =>
      (companiesData?.items ?? []).map((c) => ({ id: c.id, name: c.name })),
    [companiesData]
  );

  const ownerOptions = useMemo<ContactOwnerLookup[]>(
    () => (ownersData?.items ?? []).map(toOwnerLookup),
    [ownersData]
  );

  const closeModal = (): void => {
    setIsAddContactModalOpen(false);
    setCrmModalType(CrmModalTypes.ADD_CONTACT_MODAL);
  };

  const handleSuccess = () => {
    setSubmitting(false);
    closeModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toasts", "successTitle"]),
      description: translateText(["toasts", "successDescription"])
    });
  };

  const handleError = () => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toasts", "errorTitle"]),
      description: translateText(["toasts", "errorDescription"])
    });
  };

  const { mutate: createContact, isPending } = useCreateContact(
    handleSuccess,
    handleError
  );

  const submitContact = (values: CreateContactFormValues) => {
    const payload: CreateContactPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      companyId: values.companyId ?? undefined,
      contactNumber: values.contactNumber
        ? `+${values.contactNumber}`
        : undefined,
      ownerId: values.ownerId ?? undefined
    };
    createContact(payload);
  };

  const validationSchema = Yup.object({
    name: Yup.string().required(
      translateText(["validations", "contactNameRequired"])
    ),
    email: Yup.string()
      .required(translateText(["validations", "emailRequired"]))
      .email(translateText(["validations", "emailInvalid"])),
    contactNumber: Yup.string()
      .nullable()
      .optional()
      .test(
        "valid-contact-number",
        translateText(["validations", "contactNumber"]),
        (value) => !value || isValidPhoneNumber().test(value)
      )
      .max(
        characterLengths.PHONE_NUMBER_LENGTH_MAX,
        translateText(["validations", "contactNumberLength"])
      )
  });

  const formik = useFormik<CreateContactFormValues>({
    initialValues: {
      name: "",
      email: "",
      company: "",
      companyId: null,
      contactNumber: "",
      ownerId: defaultOwner?.employeeId ?? null
    },
    onSubmit: submitContact,
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false
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

  useEffect(() => {
    if (defaultOwner && !selectedOwner) {
      setSelectedOwner(defaultOwner);
      setFieldValue("ownerId", defaultOwner.employeeId);
    }
  }, [defaultOwner]);

  useEffect(() => {
    if (selectedOwner || !previousOwner) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (ownerSectionRef.current && !ownerSectionRef.current.contains(target)) {
        setSelectedOwner(previousOwner);
        setFieldValue("ownerId", previousOwner.employeeId);
        setPreviousOwner(null);
        setOwnerSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOwner, previousOwner]);

  const handleOwnerSelect = (owner: ContactOwnerLookup) => {
    setPreviousOwner(null);
    setSelectedOwner(owner);
    setFieldValue("ownerId", owner.employeeId);
    setOwnerSearch("");
  };

  const handleOwnerClear = () => {
    setPreviousOwner(selectedOwner);
    setSelectedOwner(null);
    setFieldValue("ownerId", null);
  };

  const handleAddCompany = () => {
    // TODO: open the "Add company" flow.
  };

  const companyItems = useMemo<DropdownItem[]>(() => {
    const term = values.company.trim().toLowerCase();
    if (!term) return [];

    const matches = companyOptions
      .filter((c) => c.name.toLowerCase().includes(term))
      .map<DropdownItem>((c) => ({
        id: String(c.id),
        content: <span className="body2 text-primary-text">{c.name}</span>
      }));

    if (matches.length === 0) return [];

    return [
      ...matches,
      {
        id: ADD_COMPANY_ID,
        content: (
          <div className="flex items-center justify-between -mx-4 -my-2 px-4 py-3 border-t border-secondary-accent bg-[#DBEAFE] text-[#2A61A0]">
            <span className="body2 font-medium text-primary truncate">
              {translateText(["buttons", "addCompany"])}
            </span>
            <PlusIcon />
          </div>
        )
      }
    ];
  }, [companyOptions, values.company, translateText]);

  const ownerItems = useMemo<DropdownItem[]>(() => {
    const term = ownerSearch.trim().toLowerCase();
    if (!term) return [];

    return ownerOptions
      .filter((o) => getFullName(o).toLowerCase().includes(term))
      .map((o) => ({
        id: String(o.employeeId),
        content: (
          <AvatarChip
            label={getFullName(o)}
            avatarProps={toAvatarProps(o)}
            showActionButton={false}
          />
        )
      }));
  }, [ownerOptions, ownerSearch]);

  const handleCompanyItemSelect = (item: DropdownItem) => {
    if (item.id === ADD_COMPANY_ID) {
      handleAddCompany();
      return;
    }
    const company = companyOptions.find((c) => String(c.id) === item.id);
    if (!company) return;
    setFieldValue("company", company.name);
    setFieldValue("companyId", company.id);
  };

  const handleOwnerItemSelect = (item: DropdownItem) => {
    const owner = ownerOptions.find((o) => String(o.employeeId) === item.id);
    if (owner) handleOwnerSelect(owner);
  };

  const companyEmptyMessage = (
    <div className="flex flex-col w-full">
      <div className="px-4 py-3 text-center body2 text-secondary-text">
        {translateText(["noResults", "company"])}
      </div>
      <button
        type="button"
        onClick={handleAddCompany}
        className="w-full bg-primary-background hover:bg-primary-background/80 border-t border-secondary-accent border-x-0 border-b-0 px-4 py-3 rounded-b-md flex items-center justify-between outline-none focus:shadow-[0px_0px_4px_0px_rgba(0,0,0,0.60)]"
      >
        <span className="body2 text-primary-text truncate">
          {translateText(["buttons", "addCompany"])}
        </span>
        <PlusIcon />
      </button>
    </div>
  );

  const ownerEmptyMessage = (
    <div className="px-4 py-3 text-center body2 text-secondary-text">
      {translateText(["noResults", "owner"])}
    </div>
  );

  const renderOwnerField = () => {
    if (selectedOwner) {
      return (
        <div className="w-full">
          <label className="subtitle1 leading-normal text-black block mb-2">
            {translateText(["labels", "contactOwner"])}
          </label>
          <div className="h-12 rounded-lg bg-gray-100 flex items-center px-3">
            <AvatarChip
              label={getFullName(selectedOwner)}
              avatarProps={toAvatarProps(selectedOwner)}
              showActionButton={!isOwnerReadonly}
              onActionClick={isOwnerReadonly ? undefined : handleOwnerClear}
              actionIcon={isOwnerReadonly ? undefined : <CloseIcon />}
              actionButtonAriaLabel={translateText(["ariaLabels", "removeOwner"])}
            />
          </div>
        </div>
      );
    }

    if (isOwnerReadonly) return null;

    return (
      <SearchableDropdown
        id="owner-search"
        items={ownerItems}
        onSelect={handleOwnerItemSelect}
        emptyMessage={ownerEmptyMessage}
        label={translateText(["labels", "contactOwner"])}
        placeholder={translateText(["placeholders", "contactOwner"])}
        value={ownerSearch}
        onChange={(e) => setOwnerSearch(e.target.value)}
      />
    );
  };

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        label={translateText(["labels", "contactName"])}
        placeholder={translateText(["placeholders", "contactName"])}
        value={values.name}
        errorMessage={errors.name || ""}
        state={errors.name ? "error" : "default"}
        required
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "contactName"])}
        fullWidth
      />

      <InputField
        name="email"
        label={translateText(["labels", "email"])}
        placeholder={translateText(["placeholders", "email"])}
        value={values.email}
        errorMessage={errors.email || ""}
        state={errors.email ? "error" : "default"}
        required
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "email"])}
        fullWidth
      />

      <SearchableDropdown
        id="company-search"
        items={companyItems}
        onSelect={handleCompanyItemSelect}
        emptyMessage={companyEmptyMessage}
        label={translateText(["labels", "company"])}
        placeholder={translateText(["placeholders", "company"])}
        value={values.company}
        onChange={(e) => {
          setFieldValue("company", e.target.value);
          setFieldValue("companyId", null);
        }}
      />

      <InputField
        name="contactNumber"
        label={translateText(["labels", "contactNo"])}
        placeholder={translateText(["placeholders", "contactNo"])}
        value={values.contactNumber}
        errorMessage={errors.contactNumber || ""}
        state={errors.contactNumber ? "error" : "default"}
        onChange={handleChange}
        aria-label={translateText(["ariaLabels", "contactNo"])}
        fullWidth
      />

      <div ref={ownerSectionRef}>{renderOwnerField()}</div>

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isSubmitting}
          onClick={closeModal}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["ariaLabels", "cancel"])}
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={() => submitForm()}
          disabled={isSubmitting || isPending}
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default CreateContactModal;
