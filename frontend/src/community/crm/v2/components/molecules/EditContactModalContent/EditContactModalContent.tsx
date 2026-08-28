import { useFormik } from "formik";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditContact } from "~community/crm/v2/api/ContactApi";
import ContactModalForm from "~community/crm/v2/components/molecules/ContactModalForm/ContactModalForm";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  getChangedContactFields,
  getContactFormInitialValues,
  getSelectedContact,
  getTrimmedContactValues,
  updateContact
} from "~community/crm/v2/utils/contactUtil";
import { getContactValidationSchema } from "~community/crm/v2/utils/contactValidations";

const EditContactModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "editContactModal"
  );

  const { contacts, selectedContactId, setContacts, setIsContactModalOpen } =
    useCrmStoreV2(
      useShallow((store) => ({
        contacts: store.contacts,
        selectedContactId: store.selectedContactId,
        setContacts: store.setContacts,
        setIsContactModalOpen: store.setIsContactModalOpen
      }))
    );

  const selectedContact = getSelectedContact(contacts, selectedContactId);

  const initialValues = getContactFormInitialValues(selectedContact);

  const formik = useFormik<CrmContactEntity>({
    initialValues,
    onSubmit: (values) => editContact(values),
    validationSchema: getContactValidationSchema(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
  };

  const handleSuccess = (updatedContact: CrmContactEntity) => {
    setSubmitting(false);

    if (selectedContactId !== null) {
      setContacts(updateContact(contacts, selectedContactId, updatedContact));
    }

    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"])
    });
  };

  const handleError = () => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText(["toastMessages", "errorDescription"])
    });
  };

  const { mutate: editSelectedContact, isPending } = useEditContact(
    handleSuccess,
    handleError
  );

  const editContact = (values: CrmContactEntity) => {
    if (selectedContactId === null) {
      return;
    }

    const changedFields = getChangedContactFields(
      initialValues,
      getTrimmedContactValues(values)
    );

    if (Object.keys(changedFields).length === 0) {
      handleCloseModal();
      return;
    }

    editSelectedContact({ id: selectedContactId, ...changedFields });
  };

  return (
    <ContactModalForm
      formik={formik}
      isPending={isPending}
      translateText={translateText}
      originalEmail={selectedContact?.email}
      onCancel={handleCloseModal}
    />
  );
};

export default EditContactModalContent;
