import { SubTaskInput } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import { useGetCrmContacts } from "~community/crm/api/ContactApi";
import { useCreateDeal } from "~community/crm/api/crmDealApi";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { DEAL_NAME_MAX_LENGTH } from "~community/crm/constants/dealConstants";
import {
  CrmErrorMessageKeyEnum,
  CrmPriorityEnum
} from "~community/crm/enums/common";
import useGetMappedDealStages from "~community/crm/hooks/useGetMappedDealStages";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactLookup,
  CrmCreateDealPayload,
  CrmInlineDealAddFormTypes
} from "~community/crm/types/CommonTypes";
import { inlineAddDealValidations } from "~community/crm/utils/dealValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

import AddDealContactSearch from "./AddDealContactSearch";

interface Props {
  onClose: () => void;
  defaultContact?: CrmContactLookup;
}

const SidePanelAddDeal: FC<Props> = ({ onClose, defaultContact }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const { setToastMessage } = useToast();

  const incrementCompanyOpenDeals = useCrmStore(
    (store) => store.incrementCompanyOpenDeals
  );

  const [selectedContact, setSelectedContact] =
    useState<CrmContactLookup | null>(defaultContact ?? null);

  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const debouncedContactSearch = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );
  const { data: contactLookupData } = useGetCrmContacts(
    debouncedContactSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    true
  );
  const contacts = contactLookupData?.items ?? [];

  const { initialStageId, isLoading: isStagesLoading } =
    useGetMappedDealStages();
  const { data: currentUser, isLoading: isUserLoading } =
    useGetUserPersonalDetails();

  const initialValues: CrmInlineDealAddFormTypes = {
    name: "",
    contactId: defaultContact ? String(defaultContact.id) : ""
  };

  const handleCreateDealSuccess = () => {
    const companyId = selectedContact?.company?.id;
    if (companyId != null) {
      incrementCompanyOpenDeals(companyId);
    }

    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["inlineAddDeal", "toastMessages", "successTitle"]),
      description: translateText([
        "inlineAddDeal",
        "toastMessages",
        "successDescription"
      ])
    });
    onClose();
  };

  const handleCreateDealError = (error: ErrorResponse) => {
    const messageKey = error?.response?.data?.results?.[0]?.messageKey;

    if (messageKey === CrmErrorMessageKeyEnum.DEAL_EXISTS) {
      formik.setFieldError(
        "name",
        translateText(["inlineAddDeal", "validations", "dealNameExists"])
      );
      return;
    }

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["inlineAddDeal", "toastMessages", "errorTitle"]),
      description: translateText([
        "inlineAddDeal",
        "toastMessages",
        "errorDescription"
      ])
    });
  };

  const { mutate: createDeal, isPending } = useCreateDeal(
    handleCreateDealSuccess,
    handleCreateDealError
  );

  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const isFormDisabled =
    isPending || isStagesLoading || isUserLoading || isCheckingCrmLimit;

  const handleSubmit = (values: CrmInlineDealAddFormTypes) => {
    guardCrmCreate(CrmLimitResource.DEALS, () => {
      const payload: CrmCreateDealPayload = {
        name: values.name.trim(),
        stageId: initialStageId!,
        contactId: Number(values.contactId),
        ownerId: Number(currentUser?.employeeId),
        priority: CrmPriorityEnum.MEDIUM
      };

      createDeal(payload);
    });
  };

  const formik = useFormik<CrmInlineDealAddFormTypes>({
    initialValues,
    validationSchema: inlineAddDealValidations(translateText),
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: handleSubmit
  });

  const handleContactChange = (contact: CrmContactLookup | null) => {
    setSelectedContact(contact);
    formik.setFieldValue("contactId", contact ? String(contact.id) : "");
  };

  const handleNameChange = (value: string) => {
    formik.setFieldValue("name", value);
  };

  const handleSave = () => {
    if (isFormDisabled) {
      return;
    }
    formik.submitForm();
  };

  return (
    <div
      className={`relative ${isFormDisabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <SubTaskInput
        prefixNode={
          <div className="w-60 shrink-0">
            <AddDealContactSearch
              contacts={contacts}
              selectedContact={selectedContact}
              onChange={handleContactChange}
              onSearch={setContactSearchTerm}
              isInvalid={
                !!(formik.touched.contactId && formik.errors.contactId)
              }
              placeholder={translateText([
                "inlineAddDeal",
                "contactPlaceholder"
              ])}
              noResultsText={translateText(["inlineAddDeal", "noResults"])}
              ariaLabel={translateText([
                "inlineAddDeal",
                "ariaLabels",
                "contact"
              ])}
              clearAriaLabel={translateText([
                "inlineAddDeal",
                "ariaLabels",
                "clearContact"
              ])}
            />
          </div>
        }
        onSave={handleSave}
        onCancel={onClose}
        onValueChange={handleNameChange}
        placeholder={translateText(["inlineAddDeal", "dealNamePlaceholder"])}
        maxLength={DEAL_NAME_MAX_LENGTH}
        required
        errorMessage={formik.errors.name}
        ariaLabels={{
          group: translateText(["inlineAddDeal", "ariaLabels", "group"]),
          saveButton: translateText([
            "inlineAddDeal",
            "ariaLabels",
            "saveDeal"
          ]),
          cancelButton: translateText([
            "inlineAddDeal",
            "ariaLabels",
            "cancelAddDeal"
          ])
        }}
      />
    </div>
  );
};

export default SidePanelAddDeal;
