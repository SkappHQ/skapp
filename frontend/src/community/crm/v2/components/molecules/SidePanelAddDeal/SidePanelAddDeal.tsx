import { SubTaskInput } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { DEAL_NAME_MAX_LENGTH } from "~community/crm/constants/dealConstants";
import { useGetContactLookup } from "~community/crm/v2/api/ContactApi";
import {
  useCheckDealNameExists,
  useCreateDeal
} from "~community/crm/v2/api/DealApi";
import { DEFAULT_LOOKUP_PAGE_SIZE } from "~community/crm/v2/constants/commonConstants";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmContactEntity,
  CrmDealEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import { CrmContactFilterRequest } from "~community/crm/v2/types/CrmTypes";
import { getInitialStageId } from "~community/crm/v2/utils/dealUtil";
import { inlineAddDealValidations } from "~community/crm/v2/utils/dealValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

import AddDealContactSearch from "./AddDealContactSearch";

interface SidePanelAddDealProps {
  onClose: () => void;
  onDealCreated: (deal: CrmDealEntity) => void;
  companyId?: number | null;
  defaultContact?: CrmContactEntity;
}

interface InlineDealFormValues {
  name: string;
  contactId: string;
}

const SidePanelAddDeal: FC<SidePanelAddDealProps> = ({
  onClose,
  onDealCreated,
  companyId,
  defaultContact
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const { setToastMessage } = useToast();

  const [selectedContact, setSelectedContact] = useState(defaultContact);
  const [contactSearchTerm, setContactSearchTerm] = useState("");

  const debouncedContactSearch = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const { stages } = useCrmStoreV2(
    useShallow((state) => ({ stages: state.stages }))
  );

  const contactFilters: CrmContactFilterRequest = {
    searchKeyword: debouncedContactSearch,
    size: DEFAULT_LOOKUP_PAGE_SIZE
  };

  if (companyId != null) {
    contactFilters.companyId = companyId;
  }

  const { data: contactLookupData } = useGetContactLookup(contactFilters);
  const { data: currentUser, isLoading: isUserLoading } =
    useGetUserPersonalDetails();

  const initialStageId = getInitialStageId(stages);

  const handleCreateDealSuccess = (createdDeal: CrmDealEntity) => {
    onDealCreated(createdDeal);
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

  const handleCreateDealError = () => {
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
    isPending ||
    isUserLoading ||
    isCheckingCrmLimit ||
    !initialStageId ||
    currentUser?.employeeId == null;

  const handleSubmit = (values: InlineDealFormValues) => {
    if (isDealNameCheckUnresolved || dealNameData?.isExists === true) {
      return;
    }

    guardCrmCreate(CrmLimitResource.DEALS, () => {
      createDeal({
        name: values.name.trim(),
        stageId: initialStageId,
        contactId: Number(values.contactId),
        ownerId: Number(currentUser?.employeeId),
        priority: CrmPriorityEnum.MEDIUM
      });
    });
  };

  const formik = useFormik<InlineDealFormValues>({
    initialValues: {
      name: "",
      contactId: defaultContact ? String(defaultContact.id) : ""
    },
    validationSchema: inlineAddDealValidations(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: handleSubmit
  });

  const trimmedDealName = formik.values.name.trim();

  const debouncedDealName = useDebounce(trimmedDealName, SEARCH_DEBOUNCE_DELAY);

  const { data: dealNameData, isFetching: isDealNameCheckFetching } =
    useCheckDealNameExists(debouncedDealName, debouncedDealName.length > 0);

  const isDealNameCheckUnresolved =
    trimmedDealName.length > 0 &&
    (trimmedDealName !== debouncedDealName || isDealNameCheckFetching);

  const nameErrorMessage = dealNameData?.isExists
    ? translateText(["inlineAddDeal", "validations", "dealNameExists"])
    : formik.errors.name;

  const handleContactChange = (contact?: CrmContactEntity) => {
    setSelectedContact(contact);
    formik.setFieldValue("contactId", contact ? String(contact.id) : "");
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
              id="add-deal-contact-search"
              contacts={contactLookupData?.items ?? []}
              selectedContact={selectedContact}
              onChange={handleContactChange}
              onSearch={setContactSearchTerm}
              state={formik.errors.contactId ? "error" : "default"}
              errorMessage={formik.errors.contactId}
              placeholder={translateText([
                "inlineAddDeal",
                "contactPlaceholder"
              ])}
              emptyMessage={translateText(["inlineAddDeal", "noResults"])}
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
        onValueChange={(value: string) => formik.setFieldValue("name", value)}
        placeholder={translateText(["inlineAddDeal", "dealNamePlaceholder"])}
        maxLength={DEAL_NAME_MAX_LENGTH}
        required
        errorMessage={nameErrorMessage}
        hasError={Boolean(nameErrorMessage) || Boolean(formik.errors.contactId)}
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
