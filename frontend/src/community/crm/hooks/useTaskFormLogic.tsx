import { FormikErrors, useFormik } from "formik";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetCrmContacts,
  useGetOwnerLookup
} from "~community/crm/api/ContactApi";
import { useGetDealLookup } from "~community/crm/api/crmDealApi";
import OwnerDropdownItem from "~community/crm/components/atoms/OwnerDropdownItem/OwnerDropdownItem";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import useGetPriorityOptions from "~community/crm/hooks/useGetPriorityOptions";
import useGetTaskTypeOptions from "~community/crm/hooks/useGetTaskTypeOptions";
import {
  CrmOwner,
  CrmTaskAddFormTypes,
  CrmTaskCategory
} from "~community/crm/types/CommonTypes";
import { addTaskValidations } from "~community/crm/utils/taskValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

export interface TaskFormLogicReturn {
  // Formik values & methods
  values: CrmTaskAddFormTypes;
  errors: FormikErrors<CrmTaskAddFormTypes>;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  setFieldValue: (
    field: string,
    value: unknown,
    shouldValidate?: boolean
  ) => void;
  submitForm: () => Promise<void>;
  isSubmitting: boolean;
  setSubmitting: (isSubmitting: boolean) => void;
  resetForm: () => void;

  // Owner state & handlers
  selectedOwner: CrmOwner | null;
  ownerSearchText: string;
  ownerDropdownItems: SearchableDropdownItem[];
  handleOwnerSelect: (item: SearchableDropdownItem) => void;
  handleOwnerSearchChange: (value: string) => void;
  handleOwnerRemove: () => void;
  isOwnerFetching: boolean;

  // Contact state & handlers
  selectedContactLabel: string;
  contactSearchText: string;
  contactDropdownItems: SearchableDropdownItem[];
  handleContactSelect: (item: SearchableDropdownItem) => void;
  handleContactSearchChange: (value: string) => void;
  handleClearContact: () => void;
  isContactFetching: boolean;

  // Deal state & handlers
  selectedDealLabel: string;
  dealSearchText: string;
  dealDropdownItems: SearchableDropdownItem[];
  handleDealSelect: (item: SearchableDropdownItem) => void;
  handleDealSearchChange: (value: string) => void;
  handleClearDeal: () => void;
  isDealFetching: boolean;

  // Options
  priorityOptions: ReturnType<typeof useGetPriorityOptions>;
  taskTypeOptions: {
    options: ReturnType<typeof useGetTaskTypeOptions>["options"];
    getCategoryById: (id: number) => CrmTaskCategory | undefined;
  };

  // Permissions
  isCrmSalesManager: boolean | undefined;

  // Translation
  translateText: ReturnType<typeof useTranslator>;

  // Reset all search/selection state
  resetSearchState: () => void;
}

type UseTaskFormLogicOptions = {
  onSubmit: (values: CrmTaskAddFormTypes) => void;
};

const useTaskFormLogic = ({
  onSubmit
}: UseTaskFormLogicOptions): TaskFormLogicReturn => {
  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const { data: currentUser } = useGetUserPersonalDetails();
  const { isCrmSalesManager } = useSessionData();

  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(null);
  const [ownerSearchText, setOwnerSearchText] = useState("");
  const [contactSearchText, setContactSearchText] = useState("");
  const [selectedContactLabel, setSelectedContactLabel] = useState("");
  const [dealSearchText, setDealSearchText] = useState("");
  const [selectedDealLabel, setSelectedDealLabel] = useState("");

  const debouncedOwnerSearch = useDebounce(
    ownerSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const debouncedContactSearch = useDebounce(
    contactSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const debouncedDealSearch = useDebounce(
    dealSearchText.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const priorityOptions = useGetPriorityOptions();
  const { options: taskTypeOptions, getCategoryById } = useGetTaskTypeOptions();

  const defaultOwner = useMemo((): CrmOwner | null => {
    if (!currentUser?.employeeId) return null;
    return {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? null,
      authPic: currentUser.authPic as string | null
    };
  }, [currentUser]);

  useEffect(() => {
    if (defaultOwner) {
      setSelectedOwner(defaultOwner);
    }
  }, [defaultOwner]);

  const initialValues: CrmTaskAddFormTypes = {
    name: "",
    type: null,
    dueDate: null,
    priority: CrmPriorityEnum.MEDIUM,
    contactId: null,
    dealId: null,
    owner: defaultOwner?.employeeId ? Number(defaultOwner.employeeId) : null,
    notes: ""
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema: addTaskValidations(translateText),
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true
  });

  const {
    values,
    errors,
    handleChange,
    isSubmitting,
    setSubmitting,
    setFieldValue,
    submitForm,
    resetForm
  } = formik;

  const { data: ownerLookupData, isFetching: isOwnerFetching } =
    useGetOwnerLookup(
      debouncedOwnerSearch,
      DEFAULT_LOOKUP_PAGE_SIZE,
      Boolean(isCrmSalesManager)
    );

  const ownerLookupItems: CrmOwner[] = ownerLookupData?.items ?? [];

  const ownerDropdownItems: SearchableDropdownItem[] = ownerLookupItems.map(
    (owner) => ({
      id: String(owner.employeeId),
      content: <OwnerDropdownItem owner={owner} />
    })
  );

  const { data: contactLookupData, isFetching: isContactFetching } =
    useGetCrmContacts(
      debouncedContactSearch,
      DEFAULT_LOOKUP_PAGE_SIZE,
      debouncedContactSearch.length > 0
    );

  const contactDropdownItems: SearchableDropdownItem[] =
    contactLookupData?.items?.map((contact) => ({
      id: String(contact.id),
      content: contact.name
    })) ?? [];

  const { data: dealLookupData, isFetching: isDealFetching } = useGetDealLookup(
    debouncedDealSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    debouncedDealSearch.length > 0
  );

  const dealDropdownItems: SearchableDropdownItem[] =
    dealLookupData?.map((deal) => ({
      id: String(deal.id),
      content: deal.name
    })) ?? [];

  const handleOwnerSelect = (item: SearchableDropdownItem) => {
    const owner = ownerLookupItems.find(
      (o) => String(o.employeeId) === item.id
    );
    if (!owner) return;
    setFieldValue("owner", owner.employeeId);
    setSelectedOwner(owner);
    setOwnerSearchText("");
  };

  const handleOwnerRemove = () => {
    setSelectedOwner(null);
    setFieldValue("owner", null);
  };

  const handleContactSelect = (item: SearchableDropdownItem) => {
    const contact = contactLookupData?.items?.find(
      (c) => String(c.id) === item.id
    );
    setFieldValue("contactId", Number(item.id));
    setSelectedContactLabel(contact?.name ?? String(item.content));
    setContactSearchText("");
  };

  const handleClearContact = () => {
    setFieldValue("contactId", null);
    setSelectedContactLabel("");
    setContactSearchText("");
  };

  const handleDealSelect = (item: SearchableDropdownItem) => {
    const deal = dealLookupData?.find((d) => String(d.id) === item.id);
    setFieldValue("dealId", Number(item.id));
    setSelectedDealLabel(deal?.name ?? String(item.content));
    setDealSearchText("");
  };

  const handleClearDeal = () => {
    setFieldValue("dealId", null);
    setSelectedDealLabel("");
    setDealSearchText("");
  };

  const resetSearchState = () => {
    setOwnerSearchText("");
    setSelectedOwner(defaultOwner);
    setContactSearchText("");
    setSelectedContactLabel("");
    setDealSearchText("");
    setSelectedDealLabel("");
  };

  return {
    values,
    errors,
    handleChange,
    setFieldValue,
    submitForm,
    isSubmitting,
    setSubmitting,
    resetForm,

    selectedOwner,
    ownerSearchText,
    ownerDropdownItems,
    handleOwnerSelect,
    handleOwnerSearchChange: setOwnerSearchText,
    handleOwnerRemove,
    isOwnerFetching,

    selectedContactLabel,
    contactSearchText,
    contactDropdownItems,
    handleContactSelect,
    handleContactSearchChange: setContactSearchText,
    handleClearContact,
    isContactFetching,

    selectedDealLabel,
    dealSearchText,
    dealDropdownItems,
    handleDealSelect,
    handleDealSearchChange: setDealSearchText,
    handleClearDeal,
    isDealFetching,

    priorityOptions,
    taskTypeOptions: { options: taskTypeOptions, getCategoryById },

    isCrmSalesManager,
    translateText,

    resetSearchState
  };
};

export default useTaskFormLogic;
