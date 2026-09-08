import { useFormik } from "formik";
import { FC, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditContact } from "~community/crm/v2/api/ContactApi";
import ContactModalForm from "~community/crm/v2/components/molecules/ContactModalForm/ContactModalForm";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  getContactFieldDiff,
  getSelectedContact,
  linkContactToCompany,
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

  const { contacts, selectedContactId, setIsContactModalOpen } = useCrmStoreV2(
    useShallow((store) => ({
      contacts: store.contacts,
      selectedContactId: store.selectedContactId,
      setIsContactModalOpen: store.setIsContactModalOpen
    }))
  );

  const selectedContact = getSelectedContact(contacts, selectedContactId);

  const initialValues = useMemo(
    () => ({
      name: selectedContact?.name ?? "",
      email: selectedContact?.email ?? "",
      contactNumber: selectedContact?.contactNumber ?? "",
      companyId: selectedContact?.companyId,
      ownerId: selectedContact?.ownerId
    }),
    [selectedContact]
  );

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
      const store = useCrmStoreV2.getState();
      const previousCompanyId = store.contacts[selectedContactId]?.companyId;

      store.setContacts(
        updateContact(store.contacts, selectedContactId, updatedContact)
      );
      store.setCompanies(
        linkContactToCompany(updatedContact, store.companies, previousCompanyId)
      );
    }

    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["contactToastMessages", "successTitle"]),
      description: translateText(["contactToastMessages", "successDescription"])
    });
  };

  const handleError = () => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["contactToastMessages", "errorTitle"]),
      description: translateText(["contactToastMessages", "errorDescription"])
    });
  };

  const { mutate: editSelectedContact, isPending } = useEditContact(
    handleSuccess,
    handleError
  );

  const editContact = (values: CrmContactEntity) => {
    if (selectedContactId === null || selectedContact === undefined) {
      setSubmitting(false);
      return;
    }

    const changedFields = getContactFieldDiff(initialValues, {
      name: values.name?.trim(),
      email: values.email?.trim(),
      contactNumber: values.contactNumber?.trim(),
      companyId: values.companyId,
      companyName: values.companyName?.trim(),
      ownerId: values.ownerId
    });

    if (Object.keys(changedFields).length === 0) {
      setSubmitting(false);
      handleCloseModal();
      return;
    }

    editSelectedContact({ id: selectedContactId, contact: changedFields });
  };

  if (selectedContact === undefined) {
    return null;
  }

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
