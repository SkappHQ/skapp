import { Spinner, SubTaskInput } from "@rootcodelabs/skapp-ui";
import { useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetCrmContacts } from "~community/crm/api/ContactApi";
import { useCreateDeal } from "~community/crm/api/crmDealApi";
import { contactQueryKeys } from "~community/crm/api/utils/QueryKeys";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { DEAL_NAME_MAX_LENGTH } from "~community/crm/constants/dealConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import useGetMappedDealStages from "~community/crm/hooks/useGetMappedDealStages";
import { isDealNameValid } from "~community/crm/regex/crmRegexPatterns";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactLookup,
  CrmCreateDealPayload
} from "~community/crm/types/CommonTypes";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

import AddDealContactSearch from "./AddDealContactSearch";

interface Props {
  onClose: () => void;
}

const SidePanelAddDeal: FC<Props> = ({ onClose }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const { setToastMessage } = useToast();
  const queryClient = useQueryClient();

  const { selectedContactId, getContactById } = useCrmStore((store) => ({
    selectedContactId: store.selectedContactId,
    getContactById: store.getContactById
  }));

  const [selectedContact, setSelectedContact] =
    useState<CrmContactLookup | null>(() => {
      const contact = selectedContactId
        ? getContactById(selectedContactId)
        : undefined;
      return contact
        ? { id: contact.id, name: contact.name, company: contact.company }
        : null;
    });

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

  const { initialStageId } = useGetMappedDealStages();
  const { data: currentUser } = useGetUserPersonalDetails();

  const handleCreateDealSuccess = () => {
    if (selectedContactId) {
      queryClient.invalidateQueries({
        queryKey: contactQueryKeys.CONTACT_BY_ID(selectedContactId)
      });
    }
    queryClient.invalidateQueries({
      queryKey: contactQueryKeys.GET_CONTACT_DATA
    });
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

  const handleSave = (name: string) => {
    if (
      isPending ||
      !isDealNameValid().test(name) ||
      !selectedContact ||
      initialStageId === undefined ||
      !currentUser?.employeeId
    ) {
      return;
    }

    const payload: CrmCreateDealPayload = {
      name,
      stageId: initialStageId,
      contactId: selectedContact.id,
      ownerId: Number(currentUser.employeeId),
      priority: CrmPriorityEnum.MEDIUM
    };

    createDeal(payload);
  };

  return (
    <div
      className={`relative ${isPending ? "opacity-50 pointer-events-none" : ""}`}
    >
      <SubTaskInput
        prefixNode={
          <div className="w-60 shrink-0">
            <AddDealContactSearch
              contacts={contacts}
              selectedContact={selectedContact}
              onChange={setSelectedContact}
              onSearch={setContactSearchTerm}
              placeholder={translateText([
                "inlineAddDeal",
                "contactPlaceholder"
              ])}
              searchPlaceholder={translateText([
                "inlineAddDeal",
                "contactSearchPlaceholder"
              ])}
              noResultsText={translateText(["inlineAddDeal", "noResults"])}
              ariaLabel={translateText([
                "inlineAddDeal",
                "ariaLabels",
                "contact"
              ])}
            />
          </div>
        }
        onSave={handleSave}
        onCancel={onClose}
        placeholder={translateText(["inlineAddDeal", "dealNamePlaceholder"])}
        maxLength={DEAL_NAME_MAX_LENGTH}
        required
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
      {isPending && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          role="status"
          aria-live="polite"
          aria-label={translateText(["inlineAddDeal", "ariaLabels", "saving"])}
        >
          <Spinner size={24} />
        </div>
      )}
    </div>
  );
};

export default SidePanelAddDeal;
