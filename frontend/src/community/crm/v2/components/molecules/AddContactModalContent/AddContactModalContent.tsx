import { useFormik } from "formik";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateContact } from "~community/crm/v2/api/ContactApi";
import ContactModalForm from "~community/crm/v2/components/molecules/ContactModalForm/ContactModalForm";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  getContactFormInitialValues,
  getTrimmedContactValues
} from "~community/crm/v2/utils/contactUtil";
import { getContactValidationSchema } from "~community/crm/v2/utils/contactValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

const AddContactModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "addContactModal"
  );

  const {
    contacts,
    contactIds,
    setContacts,
    setContactIds,
    setIsContactModalOpen
  } = useCrmStoreV2(
    useShallow((store) => ({
      contacts: store.contacts,
      contactIds: store.contactIds,
      setContacts: store.setContacts,
      setContactIds: store.setContactIds,
      setIsContactModalOpen: store.setIsContactModalOpen
    }))
  );

  const { data: currentUser } = useGetUserPersonalDetails();

  const formik = useFormik<CrmContactEntity>({
    initialValues: getContactFormInitialValues(
      undefined,
      Number(currentUser?.employeeId)
    ),
    onSubmit: (values) => createContact(values),
    validationSchema: getContactValidationSchema(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
  };

  const handleSuccess = (createdContact: CrmContactEntity) => {
    setSubmitting(false);

    if (createdContact.id !== undefined) {
      setContacts({ ...contacts, [createdContact.id]: createdContact });
      setContactIds([createdContact.id, ...contactIds]);
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

  const { mutate: createNewContact, isPending } = useCreateContact(
    handleSuccess,
    handleError
  );

  const createContact = (values: CrmContactEntity) => {
    createNewContact(getTrimmedContactValues(values));
  };

  return (
    <ContactModalForm
      formik={formik}
      isPending={isPending}
      translateText={translateText}
      onCancel={handleCloseModal}
    />
  );
};

export default AddContactModalContent;
