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
  getTrimmedContactValues,
  linkContactToCompany
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
    companies,
    contactIds,
    setContacts,
    setCompanies,
    setContactIds,
    setIsContactModalOpen
  } = useCrmStoreV2(
    useShallow((store) => ({
      contacts: store.contacts,
      companies: store.companies,
      contactIds: store.contactIds,
      setContacts: store.setContacts,
      setCompanies: store.setCompanies,
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

      setCompanies(linkContactToCompany(createdContact, companies));
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
      canAddNewCompany
      onCancel={handleCloseModal}
    />
  );
};

export default AddContactModalContent;
