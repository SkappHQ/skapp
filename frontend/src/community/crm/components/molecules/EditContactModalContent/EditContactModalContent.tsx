import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditContact } from "~community/crm/api/ContactApi";
import ContactModalForm from "~community/crm/components/molecules/ContactModalForm/ContactModalForm";
import { useCrmStore } from "~community/crm/store/store";
import { CrmContactFormValues } from "~community/crm/types/CommonTypes";
import { getChangedContactFields } from "~community/crm/utils/crmUtil";

const EditContactModalContent = () => {
  const { setToastMessage } = useToast();
  const translateContactText = useTranslator(
    "crmModule",
    "contacts",
    "editContactModal"
  );
  const {
    setIsContactModalOpen,
    selectedContactId,
    getContactById,
    updateContact
  } = useCrmStore((store) => ({
    setIsContactModalOpen: store.setIsContactModalOpen,
    selectedContactId: store.selectedContactId,
    getContactById: store.getContactById,
    updateContact: store.updateContact
  }));

  const selectedContact = getContactById(selectedContactId!);

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
  };

  const { mutate: editContact, isPending } = useEditContact(
    (data) => {
      updateContact(data);
      handleCloseModal();
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateContactText(["contactToastMessages", "successTitle"]),
        description: translateContactText([
          "contactToastMessages",
          "successDescription"
        ])
      });
    },
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

  const initialValues: CrmContactFormValues = {
    name: selectedContact?.name,
    email: selectedContact?.email,
    contactNumber: selectedContact?.contactNumber ?? "",
    companyId: selectedContact?.company?.id ?? null,
    ownerId: selectedContact?.owner?.employeeId ?? null
  };

  const submitEditContact = (values: CrmContactFormValues) => {
    const normalizedValues: CrmContactFormValues = {
      name: values.name.trim(),
      email: values.email.trim(),
      contactNumber: values.contactNumber.trim(),
      companyId: values.companyId,
      ownerId: values.ownerId
    };
    const originalValues: CrmContactFormValues = {
      name: selectedContact?.name.trim() ?? "",
      email: selectedContact?.email.trim() ?? "",
      contactNumber: selectedContact?.contactNumber?.trim() ?? "",
      companyId: selectedContact?.company?.id ?? null,
      ownerId: selectedContact?.owner?.employeeId ?? null
    };
    const changedFields = getChangedContactFields(
      normalizedValues,
      originalValues
    );

    if (Object.keys(changedFields).length === 0) return;

    editContact({
      id: selectedContact?.id,
      companyId: normalizedValues.companyId,
      ...changedFields
    });
  };

  return (
    <ContactModalForm
      translateContactText={translateContactText}
      initialValues={initialValues}
      initialOwner={selectedContact?.owner ?? null}
      initialCompanyName={selectedContact?.company?.name}
      isPending={isPending}
      onSubmit={submitEditContact}
      onCancel={handleCloseModal}
    />
  );
};

export default EditContactModalContent;
