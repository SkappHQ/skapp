import {
  ButtonV2,
  Dropdown,
  DropdownOption,
  InputField,
  SidePanel,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import {
  ChangeEvent,
  FC,
  FocusEvent,
  useEffect,
  useMemo,
  useState
} from "react";

import PlusIcon from "~community/common/assets/Icons/PlusIcon";
import MultipleSkeletons from "~community/common/components/molecules/Skeletons/MultipleSkeletons";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetCrmContacts,
  useGetOwnerLookup
} from "~community/crm/api/ContactApi";
import { useCreateDeal, useGetDealStages } from "~community/crm/api/crmDealApi";
import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import PeoplePopupSearch from "~community/crm/components/molecules/PeoplePopupSearch/PeoplePopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { CrmDealStageEnum, CrmPriorityEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactLookup,
  CrmDealAddFormTypes,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { addDealValidations } from "~community/crm/utils/dealValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

interface AmountFieldProps {
  isEditing: boolean;
  value: string;
  isTouched: boolean | undefined;
  error: string | undefined;
  placeholder: string;
  nonePlaceholder: string;
  ariaLabel: string;
  onEdit: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement>) => void;
}

const AmountField: FC<AmountFieldProps> = ({
  isEditing,
  value,
  isTouched,
  error,
  placeholder,
  nonePlaceholder,
  ariaLabel,
  onEdit,
  onChange,
  onBlur
}) => {
  if (isEditing) {
    return (
      <div className="flex-1 min-w-0">
        <InputField
          name="amount"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          type="text"
          variant="sm"
          fullWidth
          autoFocus
          state={isTouched && error ? "error" : "default"}
          errorMessage={isTouched ? error : undefined}
          aria-label={ariaLabel}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <button
        type="button"
        className={`body2 text-left w-full pl-1 ${
          value ? "text-black" : "text-tertiary-text"
        }`}
        onClick={onEdit}
      >
        {value || nonePlaceholder}
      </button>
      {isTouched && error && (
        <p className="text-semantic-red-text body3 mt-1">{error}</p>
      )}
    </div>
  );
};

const AddDealSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const { setToastMessage } = useToast();
  const { isCrmSalesManager } = useSessionData();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(null);
  const [selectedContact, setSelectedContact] =
    useState<CrmContactLookup | null>(null);
  const [isOwnerInitialized, setIsOwnerInitialized] = useState(false);

  const { isCrmSidePanelOpen, setIsCrmSidePanelOpen } = useCrmStore(
    (store) => ({
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
    })
  );

  const {
    data: stages = [],
    isLoading: isStagesLoading,
    isError: isStagesError
  } = useGetDealStages(isCrmSidePanelOpen);
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const debouncedContactSearch = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const { data: contactLookupData } = useGetCrmContacts(
    debouncedContactSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isCrmSidePanelOpen
  );
  const contacts = contactLookupData?.items ?? [];

  const isOwnerReadonly = !isCrmSalesManager;

  const [ownerSearchTerm, setOwnerSearchTerm] = useState("");
  const debouncedOwnerSearch = useDebounce(
    ownerSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const { data: ownerLookupData } = useGetOwnerLookup(
    debouncedOwnerSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isCrmSidePanelOpen && !isOwnerReadonly
  );
  const owners = ownerLookupData?.items ?? [];

  const { data: currentUser } = useGetUserPersonalDetails();

  const stageOptions = useMemo<DropdownOption[]>(
    () =>
      stages.map((s) => ({
        id: String(s.id),
        value: String(s.id),
        label: (
          <div className="inline-flex items-center gap-2.5">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="body2">{s.name}</span>
          </div>
        )
      })),
    [stages]
  );

  const { mutate: createDeal, isPending } = useCreateDeal(
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["toastMessages", "successTitle"]),
        description: translateText(["toastMessages", "successDescription"])
      });
      formik.resetForm();
      setEditingField(null);
      setSelectedOwner(null);
      setSelectedContact(null);
      setIsOwnerInitialized(false);
      setIsCrmSidePanelOpen(false);
    },
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["toastMessages", "errorTitle"]),
        description: translateText(["toastMessages", "errorDescription"])
      });
    }
  );

  const formik = useFormik<CrmDealAddFormTypes>({
    initialValues: {
      name: "",
      stageId: "",
      contactId: "",
      ownerId: "",
      priority: CrmPriorityEnum.LOW,
      amount: "",
      description: ""
    },
    validationSchema: addDealValidations(translateText),
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: (values) => {
      createDeal({
        name: values.name.trim(),
        stageId: Number(values.stageId),
        contactId: Number(values.contactId),
        ownerId: Number(values.ownerId),
        priority: values.priority,
        ...(values.amount && { amount: values.amount }),
        ...(values.description && { description: values.description })
      });
    }
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    resetForm,
    isSubmitting,
    submitForm
  } = formik;

  useEffect(() => {
    if (!isCrmSidePanelOpen || stages.length === 0) return;
    const leadStage = stages.find(
      (s) => s.stageType === CrmDealStageEnum.INITIAL
    );
    if (leadStage) {
      setFieldValue("stageId", String(leadStage.id));
    }
  }, [isCrmSidePanelOpen, stages]);

  useEffect(() => {
    if (!currentUser || isOwnerInitialized) return;
    if (!currentUser.employeeId) return;
    const owner: CrmOwner = {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? null,
      authPic:
        typeof currentUser.authPic === "string" ? currentUser.authPic : null
    };
    setSelectedOwner(owner);
    setFieldValue("ownerId", String(owner.employeeId));
    setIsOwnerInitialized(true);
  }, [currentUser, isOwnerInitialized]);

  const handleClose = () => {
    resetForm();
    setEditingField(null);
    setSelectedOwner(null);
    setSelectedContact(null);
    setIsOwnerInitialized(false);
    setIsCrmSidePanelOpen(false);
  };

  let stageErrorMessage: string | undefined;

  if (isStagesError) {
    stageErrorMessage = translateText(["validations", "stageLoadError"]);
  } else if (touched.stageId) {
    stageErrorMessage = errors.stageId;
  }

  const stageDropdownVariant =
    (touched.stageId && errors.stageId) || isStagesError
      ? "primary-error"
      : "primary";

  const hasFormData = !!(
    values.name ||
    values.description ||
    values.amount ||
    values.contactId
  );

  return (
    <div className="crm-deal-side-panel">
      <SidePanel
        isOpen={isCrmSidePanelOpen}
        onClose={handleClose}
        header={
          <span className="pl-2 text-2xl font-bold text-black">
            {translateText(["title"])}
          </span>
        }
        width="xl"
        animation="slide"
        closeOnBackdropClick={!hasFormData}
        closeAriaLabel={translateText(["ariaLabels", "closePanel"])}
        footer={
          <div className="flex justify-end px-6 py-3">
            <ButtonV2
              variant="primary"
              size="md"
              onClick={() => submitForm()}
              disabled={isSubmitting || isPending}
              isLoading={isPending}
              icon={<PlusIcon fill="black" />}
              iconPosition="end"
              aria-label={translateText(["ariaLabels", "addDeal"])}
            >
              {translateText(["buttons", "addDeal"])}
            </ButtonV2>
          </div>
        }
      >
        <div className="flex flex-col gap-6 h-full">
          <div className="flex gap-6 items-start">
            <div className="flex-[2_1_0] min-w-0">
              <InputField
                label={translateText(["labels", "dealName"])}
                placeholder={translateText(["placeholders", "dealName"])}
                required
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                state={touched.name && errors.name ? "error" : "default"}
                errorMessage={touched.name ? errors.name : undefined}
                fullWidth
                aria-label={translateText(["ariaLabels", "dealName"])}
              />
            </div>
            <div className="flex-[1_0_0] min-w-0 pt-6.5">
              {isStagesLoading ? (
                <MultipleSkeletons numOfSkeletons={1} height={38} />
              ) : (
                <Dropdown
                  options={stageOptions}
                  value={values.stageId}
                  onChange={(v) => setFieldValue("stageId", v)}
                  variant={stageDropdownVariant}
                  className="rounded-lg"
                  width="55%"
                  placeholder={translateText(["placeholders", "stage"])}
                  required
                  errorMessage={stageErrorMessage}
                  ariaLabel={translateText(["ariaLabels", "stage"])}
                />
              )}
            </div>
          </div>

          <div className="flex gap-6 items-start flex-1">
            <div className="flex-[2_1_0] min-w-0">
              <TextArea
                label={translateText(["labels", "description"])}
                placeholder={translateText(["placeholders", "description"])}
                value={values.description}
                onChange={(e) => setFieldValue("description", e.target.value)}
                onBlur={handleBlur}
                className="w-full h-30.25"
                aria-label={translateText(["ariaLabels", "description"])}
              />
            </div>

            <div className="flex-[1_0_0] min-w-0 flex flex-col gap-4">
              <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2 w-full">
                <PropertyRow label={translateText(["labels", "value"])}>
                  <AmountField
                    isEditing={editingField === "amount"}
                    value={values.amount}
                    isTouched={touched.amount}
                    error={errors.amount}
                    placeholder={translateText(["placeholders", "amount"])}
                    nonePlaceholder={translateText(["placeholders", "none"])}
                    ariaLabel={translateText(["ariaLabels", "amount"])}
                    onEdit={() => setEditingField("amount")}
                    onChange={handleChange}
                    onBlur={(e) => {
                      handleBlur(e);
                      setEditingField(null);
                    }}
                  />
                </PropertyRow>

                <PropertyRow label={translateText(["labels", "priority"])}>
                  <PriorityDropdown
                    value={values.priority}
                    onChange={(v) => setFieldValue("priority", v)}
                  />
                </PropertyRow>

                <PropertyRow label={translateText(["labels", "ownedBy"])}>
                  <div
                    className={`flex flex-col w-full${
                      isOwnerReadonly ? " pointer-events-none" : ""
                    }`}
                  >
                    <PeoplePopupSearch
                      users={owners}
                      selectedUser={selectedOwner}
                      onSearch={setOwnerSearchTerm}
                      onChange={(user: CrmOwner | null) => {
                        setSelectedOwner(user);
                        setFieldValue(
                          "ownerId",
                          user ? String(user.employeeId) : ""
                        );
                      }}
                      placeholder={translateText(["placeholders", "none"])}
                      searchPlaceholder={translateText([
                        "placeholders",
                        "ownerSearch"
                      ])}
                      noResultsText={translateText([
                        "placeholders",
                        "noResults"
                      ])}
                      ariaInvalid={!!(touched.ownerId && errors.ownerId)}
                      chipBackgroundColor="bg-gray-100"
                    />
                    {touched.ownerId && errors.ownerId && (
                      <p className="text-semantic-red-text body3 mt-1">
                        {errors.ownerId}
                      </p>
                    )}
                  </div>
                </PropertyRow>

                <PropertyRow label={translateText(["labels", "contactName"])}>
                  <div className="flex flex-col w-full">
                    <ContactPopupSearch
                      contacts={contacts}
                      selectedContact={selectedContact}
                      onChange={(c: CrmContactLookup | null) => {
                        setSelectedContact(c);
                        setFieldValue("contactId", c ? String(c.id) : "");
                      }}
                      onSearch={setContactSearchTerm}
                      placeholder={translateText(["placeholders", "none"])}
                      searchPlaceholder={translateText([
                        "placeholders",
                        "contactSearch"
                      ])}
                      noResultsText={translateText([
                        "placeholders",
                        "noResults"
                      ])}
                      ariaInvalid={!!(touched.contactId && errors.contactId)}
                    />
                    {touched.contactId && errors.contactId && (
                      <p className="text-semantic-red-text body3 mt-1">
                        {errors.contactId}
                      </p>
                    )}
                  </div>
                </PropertyRow>
              </div>
            </div>
          </div>
        </div>
      </SidePanel>
    </div>
  );
};

export default AddDealSidePanel;
