import {
  ButtonV2,
  Dropdown,
  InputField,
  SidePanel,
  TextArea
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/Dropdown/Dropdown";
import { useFormik } from "formik";
import { FC, KeyboardEvent, useEffect, useMemo, useState } from "react";

import PlusIcon from "~community/common/assets/Icons/PlusIcon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetCrmContacts, useGetOwnerLookup } from "~community/crm/api/ContactApi";
import { useCreateDeal, useGetDealStages } from "~community/crm/api/crmDealApi";
import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import PeoplePopupSearch from "~community/crm/components/molecules/PeoplePopupSearch/PeoplePopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import { DEFAULT_LOOKUP_PAGE_SIZE, SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/commonConstants";
import { CrmDealStageEnum, CrmPriorityEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactLookup,
  CrmDealAddFormTypes,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { addDealValidations } from "~community/crm/utils/dealValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

const handleAmountKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
  if (["e", "E", "+", "-"].includes(e.key)) {
    e.preventDefault();
  }
};

const AddDealSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const { setToastMessage } = useToast();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(null);
  const [isOwnerInitialized, setIsOwnerInitialized] = useState(false);

  const { isCrmSidePanelOpen, setIsCrmSidePanelOpen } = useCrmStore(
    (store) => ({
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
    })
  );

  const { data: stages = [] } = useGetDealStages();
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const debouncedContactSearch = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const { data: contactLookupData } = useGetCrmContacts(
    debouncedContactSearch,
    DEFAULT_LOOKUP_PAGE_SIZE
  );
  const contacts = contactLookupData?.items ?? [];

  const [ownerSearchTerm, setOwnerSearchTerm] = useState("");
  const debouncedOwnerSearch = useDebounce(
    ownerSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const { data: ownerLookupData } = useGetOwnerLookup(
    debouncedOwnerSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    true
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
              style={{ backgroundColor: s.color ?? "#6B7280" }}
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
      priority: CrmPriorityEnum.MEDIUM,
      amount: "",
      description: ""
    },
    validationSchema: addDealValidations(translateText),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      createDeal({
        name: values.name.trim(),
        stageId: Number(values.stageId),
        contactId: Number(values.contactId),
        ownerId: Number(values.ownerId),
        priority: values.priority as CrmPriorityEnum,
        ...(values.amount && { amount: values.amount }),
        ...(values.description && { description: values.description })
      });
    }
  });

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    setFieldValue,
    resetForm,
    isSubmitting,
    submitForm
  } = formik;

  useEffect(() => {
    if (stages.length > 0 && !values.stageId) {
      const leadStage = stages.find(
        (s) => s.stageType === CrmDealStageEnum.INITIAL
      );
      if (leadStage) {
        setFieldValue("stageId", String(leadStage.id));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages]);

  useEffect(() => {
    if (!currentUser || isOwnerInitialized) return;
    const owner: CrmOwner = {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? null,
      authPic: currentUser.authPic as string | null
    };
    setSelectedOwner(owner);
    setFieldValue("ownerId", String(owner.employeeId));
    setIsOwnerInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isOwnerInitialized]);

  const selectedContact = useMemo<CrmContactLookup | null>(
    () =>
      values.contactId
        ? (contacts.find((c) => String(c.id) === values.contactId) ?? null)
        : null,
    [values.contactId, contacts]
  );

  const handleClose = () => {
    resetForm();
    setEditingField(null);
    setSelectedOwner(null);
    setIsOwnerInitialized(false);
    setIsCrmSidePanelOpen(false);
  };

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
        closeOnBackdropClick={
          !values.name && !values.description && !values.amount && !values.contactId
        }
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
                state={errors.name ? "error" : "default"}
                errorMessage={errors.name}
                fullWidth
                aria-label={translateText(["ariaLabels", "dealName"])}
              />
            </div>
            <div className="flex-[1_0_0] min-w-0 pt-6.5">
              <Dropdown
                options={stageOptions}
                value={values.stageId}
                onChange={(v) => setFieldValue("stageId", v)}
                variant="jsx-content"
                className="rounded-lg"
                width="55%"
                placeholder={translateText(["labels", "stage"])}
                errorMessage={errors.stageId}
                ariaLabel={translateText(["ariaLabels", "stage"])}
              />
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
              <div className="border border-[#E5E7EB] rounded-lg p-3 flex flex-col gap-2 w-full">
                <PropertyRow label={translateText(["labels", "value"])}>
                  {editingField === "amount" ? (
                    <div className="flex-1 min-w-0">
                      <InputField
                        name="amount"
                        value={values.amount}
                        onChange={handleChange}
                        onBlur={(e) => {
                          handleBlur(e);
                          setEditingField(null);
                        }}
                        placeholder={translateText(["placeholders", "amount"])}
                        type="text"
                        onKeyDown={handleAmountKeyDown}
                        variant="sm"
                        fullWidth
                        autoFocus
                        state={errors.amount ? "error" : "default"}
                        errorMessage={errors.amount}
                        aria-label={translateText(["ariaLabels", "amount"])}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col w-full">
                      <button
                        type="button"
                        className={`text-[14px] text-left w-full pl-1 ${values.amount ? "text-black" : "text-tertiary-text"}`}
                        onClick={() => setEditingField("amount")}
                      >
                        {values.amount || translateText(["placeholders", "none"])}
                      </button>
                      {errors.amount && (
                        <p className="text-semantic-red-text text-[12px] mt-1">
                          {errors.amount}
                        </p>
                      )}
                    </div>
                  )}
                </PropertyRow>

                <PropertyRow label={translateText(["labels", "priority"])}>
                  <PriorityDropdown
                    value={values.priority as CrmPriorityEnum}
                    onChange={(v) => setFieldValue("priority", v)}
                  />
                </PropertyRow>

                <PropertyRow label={translateText(["labels", "ownedBy"])}>
                  <div className="flex flex-col w-full">
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
                      ariaInvalid={!!errors.ownerId}
                    />
                    {errors.ownerId && (
                      <p className="text-semantic-red-text text-[12px] mt-1">
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
                      onChange={(c: CrmContactLookup | null) =>
                        setFieldValue("contactId", c ? String(c.id) : "")
                      }
                      onSearch={setContactSearchTerm}
                      placeholder={translateText(["placeholders", "none"])}
                      searchPlaceholder={translateText([
                        "placeholders",
                        "contactSearch"
                      ])}
                      ariaInvalid={!!errors.contactId}
                    />
                    {errors.contactId && (
                      <p className="text-semantic-red-text text-[12px] mt-1">
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
