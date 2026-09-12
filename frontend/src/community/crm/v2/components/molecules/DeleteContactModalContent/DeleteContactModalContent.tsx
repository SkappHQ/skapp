import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useDeleteContact } from "~community/crm/v2/api/ContactApi";
import CrmDeleteModalContent from "~community/crm/v2/components/molecules/CrmDeleteModalContent/CrmDeleteModalContent";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  getSelectedContact,
  removeContact,
  unlinkContactFromCompany
} from "~community/crm/v2/utils/contactUtil";

const DeleteContactModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "deleteContactModal"
  );

  const {
    contacts,
    selectedContactId,
    contactIds,
    companies,
    setContacts,
    setContactIds,
    setCompanies,
    setSelectedContactId,
    closeCrmSidePanel,
    setIsContactModalOpen
  } = useCrmStoreV2(
    useShallow((state) => ({
      contacts: state.contacts,
      contactIds: state.contactIds,
      companies: state.companies,
      selectedContactId: state.selectedContactId,
      setContacts: state.setContacts,
      setContactIds: state.setContactIds,
      setCompanies: state.setCompanies,
      setSelectedContactId: state.setSelectedContactId,
      closeCrmSidePanel: state.closeCrmSidePanel,
      setIsContactModalOpen: state.setIsContactModalOpen
    }))
  );

  const selectedContact = getSelectedContact(contacts, selectedContactId);

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
  };

  const handleSuccess = () => {
    if (selectedContactId !== null) {
      const remaining = removeContact(contacts, contactIds, selectedContactId);

      setContacts(remaining.contacts);
      setContactIds(remaining.contactIds);

      if (selectedContact?.companyId != null) {
        setCompanies(
          unlinkContactFromCompany(
            companies,
            selectedContact.companyId,
            selectedContactId
          )
        );
      }
    }

    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"], {
        contactName: selectedContact?.name
      })
    });

    handleCloseModal();
    closeCrmSidePanel();
    setSelectedContactId(null);
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText(["toastMessages", "errorDescription"])
    });
  };

  const { mutate: deleteSelectedContact, isPending } = useDeleteContact(
    handleSuccess,
    handleError
  );

  const handleDeleteContact = () => {
    if (selectedContactId !== null) {
      deleteSelectedContact(selectedContactId);
    }
  };

  if (!selectedContact) {
    return null;
  }

  return (
    <CrmDeleteModalContent
      description={translateText(["description"], {
        contactName: selectedContact?.name
      })}
      isPending={isPending}
      confirmLabel={translateText(["buttons", "confirm"])}
      cancelLabel={translateText(["buttons", "cancel"])}
      confirmAriaLabel={translateText(["ariaLabels", "confirm"])}
      cancelAriaLabel={translateText(["ariaLabels", "cancel"])}
      onConfirm={handleDeleteContact}
      onClose={handleCloseModal}
    />
  );
};

export default DeleteContactModalContent;
