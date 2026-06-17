import { ButtonV2, SidePanel, TextArea } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC, useEffect, useMemo, useState } from "react";

import PlusIcon from "~community/common/assets/Icons/PlusIcon";
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

import DealNameStageSection from "./DealNameStageSection";
import DealPropertiesSection from "./DealPropertiesSection";

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

  const stageOptions = useMemo(
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

  const handleCreateDealSuccess = () => {
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
  };

  const handleCreateDealError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText(["toastMessages", "errorDescription"])
    });
  };

  const { mutate: createDeal, isPending } = useCreateDeal(
    handleCreateDealSuccess,
    handleCreateDealError
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
      ? ("primary-error" as const)
      : ("primary" as const);

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
          <DealNameStageSection
            translateText={translateText}
            values={values}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            handleBlur={handleBlur}
            setFieldValue={setFieldValue}
            isStagesLoading={isStagesLoading}
            stageOptions={stageOptions}
            stageErrorMessage={stageErrorMessage}
            stageDropdownVariant={stageDropdownVariant}
          />

          <div className="flex gap-6 items-start flex-1">
            <div className="w-2/3">
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

            <div className="w-1/3 flex flex-col gap-4">
              <DealPropertiesSection
                translateText={translateText}
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
                editingField={editingField}
                setEditingField={setEditingField}
                isOwnerReadonly={isOwnerReadonly}
                owners={owners}
                selectedOwner={selectedOwner}
                setSelectedOwner={setSelectedOwner}
                setOwnerSearchTerm={setOwnerSearchTerm}
                contacts={contacts}
                selectedContact={selectedContact}
                setSelectedContact={setSelectedContact}
                setContactSearchTerm={setContactSearchTerm}
              />
            </div>
          </div>
        </div>
      </SidePanel>
    </div>
  );
};

export default AddDealSidePanel;
