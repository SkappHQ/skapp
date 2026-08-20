import { ButtonV2, SidePanel, TextArea } from "@rootcodelabs/skapp-ui";
import { FormikHelpers, useFormik } from "formik";
import { ChangeEvent, FC, useState } from "react";

import PlusIcon from "~community/common/assets/Icons/PlusIcon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useGetContactLookupV2 } from "~community/crm/v2/api/ContactApi";
import {
  useCheckDealNameExists,
  useCreateDeal
} from "~community/crm/v2/api/DealApi";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmContactLookupItem,
  CrmDealAddFormTypes,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";
import { addDealValidations } from "~community/crm/v2/utils/dealValidations";
import { ingestCreatedDeal } from "~community/crm/v2/utils/dealIngest";

import DealNameStageSection from "./DealNameStageSection";
import DealPropertiesSection from "./DealPropertiesSection";

const initialValues: CrmDealAddFormTypes = {
  name: "",
  stageId: "",
  contactId: "",
  ownerId: "",
  priority: CrmPriorityEnum.MEDIUM,
  amount: "",
  description: ""
};

const AddDealSidePanelV2: FC = () => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const { setToastMessage } = useToast();

  const [selectedContact, setSelectedContact] =
    useState<CrmContactLookupItem | null>(null);

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    closeCrmSidePanel,
    setPreselectedStageId
  } = useCrmStoreV2((store) => ({
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    crmSidePanelType: store.crmSidePanelType,
    closeCrmSidePanel: store.closeCrmSidePanel,
    setPreselectedStageId: store.setPreselectedStageId
  }));

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.ADD_DEAL_SIDE_PANEL;

  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const debouncedContactSearch = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const { data: contactLookupData } = useGetContactLookupV2(
    debouncedContactSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isOpen
  );
  const contacts = contactLookupData?.items ?? [];

  const handleCreateDealSuccess = (createdDeal: CrmDealEntity) => {
    ingestCreatedDeal(createdDeal);
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"])
    });
    closeCrmSidePanel();
    formik.resetForm();
    setSelectedContact(null);
    setPreselectedStageId(null);
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

  const handleSubmit = (
    values: CrmDealAddFormTypes,
    { setSubmitting }: FormikHelpers<CrmDealAddFormTypes>
  ) => {
    setSubmitting(false);

    if (isDealNameCheckUnresolved || dealNameData?.isExists) {
      return;
    }

    const payload: CrmDealEntity = {
      name: values.name.trim(),
      stageId: Number(values.stageId),
      contactId: Number(values.contactId),
      ownerId: Number(values.ownerId),
      priority: values.priority,
      amount: values.amount || undefined,
      description: values.description || undefined
    };

    createDeal(payload);
  };

  const formik = useFormik<CrmDealAddFormTypes>({
    initialValues,
    validationSchema: addDealValidations(translateText),
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: handleSubmit
  });

  const { values, setFieldValue, resetForm, isSubmitting, submitForm } = formik;

  const debouncedDealName = useDebounce(
    values.name.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const { data: dealNameData, isFetching: isDealNameCheckFetching } =
    useCheckDealNameExists(debouncedDealName, debouncedDealName.length > 0);

  const isDealNameCheckUnresolved =
    values.name.trim().length > 0 &&
    (values.name.trim() !== debouncedDealName || isDealNameCheckFetching);

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setFieldValue("description", e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleClose = () => {
    closeCrmSidePanel();
    resetForm();
    setSelectedContact(null);
    setPreselectedStageId(null);
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
          <DealNameStageSection
            formik={formik}
            isDuplicateName={dealNameData?.isExists ?? false}
          />

          <div className="flex gap-6 items-start flex-1">
            <div className="w-2/3">
              <TextArea
                name="description"
                label={translateText(["labels", "description"])}
                placeholder={translateText(["placeholders", "description"])}
                value={values.description}
                onChange={handleDescriptionChange}
                onBlur={formik.handleBlur}
                className="w-full min-h-[23.6vh]"
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

            <div className="w-1/3 min-w-0 flex flex-col gap-4">
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

export default AddDealSidePanelV2;
