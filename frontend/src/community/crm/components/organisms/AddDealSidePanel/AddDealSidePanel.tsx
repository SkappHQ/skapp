import { ButtonV2, SidePanel, TextArea } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC, useEffect, useMemo, useState } from "react";

import PlusIcon from "~community/common/assets/Icons/PlusIcon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetCrmContacts } from "~community/crm/api/ContactApi";
import { useCreateDeal } from "~community/crm/api/crmDealApi";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactLookup,
  CrmCreateDealPayload,
  CrmDealAddFormTypes
} from "~community/crm/types/CommonTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import { addDealValidations } from "~community/crm/utils/dealValidations";

import DealNameStageSection from "./DealNameStageSection";
import DealPropertiesSection from "./DealPropertiesSection";

const AddDealSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const { setToastMessage } = useToast();

  const [selectedContact, setSelectedContact] =
    useState<CrmContactLookup | null>(null);

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    selectedContactId,
    getContactById,
    popCrmSidePanel
  } = useCrmStore((store) => ({
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    crmSidePanelType: store.crmSidePanelType,
    selectedContactId: store.selectedContactId,
    getContactById: store.getContactById,
    popCrmSidePanel: store.popCrmSidePanel
  }));

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.ADD_DEAL_SIDE_PANEL;

  useEffect(() => {
    setSelectedContact(getContactById(selectedContactId!) ?? null);
  }, [selectedContactId]);

  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const debouncedContactSearch = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const { data: contactLookupData } = useGetCrmContacts(
    debouncedContactSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isOpen
  );
  const contacts = contactLookupData?.items ?? [];

  const handleCreateDealSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"])
    });
    formik.resetForm();
    setSelectedContact(null);
    popCrmSidePanel();
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

  const handleSubmit = (values: CrmDealAddFormTypes) => {
    const payload: CrmCreateDealPayload = {
      name: values.name.trim(),
      stageId: Number(values.stageId),
      contactId: Number(values.contactId),
      ownerId: Number(values.ownerId),
      priority: values.priority,
      amount: values.amount,
      description: values.description
    };
    createDeal(payload);
  };

  const initialValues: CrmDealAddFormTypes = useMemo(
    () => ({
      name: "",
      stageId: "",
      contactId: selectedContactId ? String(selectedContactId) : "",
      ownerId: "",
      priority: CrmPriorityEnum.LOW,
      amount: "",
      description: ""
    }),
    [selectedContactId]
  );

  const formik = useFormik<CrmDealAddFormTypes>({
    initialValues,
    validationSchema: addDealValidations(translateText),
    validateOnChange: true,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: handleSubmit
  });

  const { values, setFieldValue, resetForm, isSubmitting, submitForm } = formik;

  const handleClose = () => {
    resetForm();
    setSelectedContact(null);
    popCrmSidePanel();
  };

  return (
    <div className="crm-deal-side-panel">
      <SidePanel
        isOpen={isOpen}
        onClose={handleClose}
        header={
          <span className="pl-2 text-2xl font-bold text-black">
            {translateText(["title"])}
          </span>
        }
        closeOnBackdropClick
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
          <DealNameStageSection formik={formik} />

          <div className="flex gap-6 items-start flex-1">
            <div className="w-2/3">
              <TextArea
                name="description"
                label={translateText(["labels", "description"])}
                placeholder={translateText(["placeholders", "description"])}
                value={values.description}
                onChange={(e) => setFieldValue("description", e.target.value)}
                onBlur={formik.handleBlur}
                className="w-full h-30.25"
                state={
                  formik.touched.description && formik.errors.description
                    ? "error"
                    : "default"
                }
                errorMessage={
                  formik.touched.description
                    ? formik.errors.description
                    : undefined
                }
                aria-label={translateText(["ariaLabels", "description"])}
              />
            </div>

            <div className="w-1/3 flex flex-col gap-4">
              <DealPropertiesSection
                translateText={translateText}
                formik={formik}
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
