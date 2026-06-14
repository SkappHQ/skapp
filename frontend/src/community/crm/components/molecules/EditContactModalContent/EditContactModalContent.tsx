import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditContact } from "~community/crm/api/ContactApi";
import ContactModalForm from "~community/crm/components/molecules/ContactModalForm/ContactModalForm";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactFormValues,
  CrmContactMetricsType,
  EditContactPayload
} from "~community/crm/types/CommonTypes";

const EditContactModalContent = () => {
  const { setToastMessage } = useToast();
  const translateContactText = useTranslator(
    "crmModule",
    "contacts",
    "editContactModal"
  );
  const { setIsAddContactModalOpen, selectedContact, setSelectedContact } =
    useCrmStore((store) => ({
      setIsAddContactModalOpen: store.setIsAddContactModalOpen,
      selectedContact: store.selectedContact,
      setSelectedContact: store.setSelectedContact
    }));

  const handleCloseModal = () => {
    setIsAddContactModalOpen(false);
  };

  const handleSuccess = (updatedData: CrmContactMetricsType) => {
    handleCloseModal();
    if (selectedContact?.id === updatedData.id) {
      setSelectedContact({
        ...selectedContact,
        ...updatedData
      });
    }
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateContactText(["contactToastMessages", "successTitle"]),
      description: translateContactText([
        "contactToastMessages",
        "successDescription"
      ])
    });
  };

  const { mutate: editContact, isPending } = useEditContact(
    handleSuccess,
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateContactText(["contactToastMessages", "errorTitle"]),
        description: translateContactText([
          "contactToastMessages",
          "errorDescription"
        ])
      });
    }
  );

  if (!selectedContact) return null;

  const initialValues: CrmContactFormValues = {
    name: selectedContact.name,
    email: selectedContact.email,
    contactNumber: selectedContact.contactNumber ?? "",
    companyId: selectedContact.company?.id ?? null,
    ownerId: selectedContact.owner?.employeeId ?? null
  };

  const submitEditContact = (values: CrmContactFormValues) => {
    const payload: EditContactPayload = {
      id: selectedContact.id,
      name: values.name.trim(),
      email: values.email.trim(),
      contactNumber: values.contactNumber.trim() || undefined,
      companyId: values.companyId ?? undefined,
      ownerId: values.ownerId ?? undefined
    };

    editContact(payload);
  };

  return (
    <ContactModalForm
      translateContactText={translateContactText}
      initialValues={initialValues}
      initialCompany={selectedContact.company}
      initialOwner={selectedContact.owner}
      isPending={isPending}
      onSubmit={submitEditContact}
      onCancel={handleCloseModal}
    />
  );
};

export default EditContactModalContent;
