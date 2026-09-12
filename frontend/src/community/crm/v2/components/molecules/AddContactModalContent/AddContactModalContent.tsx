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
import { linkContactToCompany } from "~community/crm/v2/utils/contactUtil";
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
    companies,
    setContacts,
    setContactIds,
    setCompanies,
    setIsContactModalOpen
  } = useCrmStoreV2(
    useShallow((state) => ({
      contacts: state.contacts,
      contactIds: state.contactIds,
      companies: state.companies,
      setContacts: state.setContacts,
      setContactIds: state.setContactIds,
      setCompanies: state.setCompanies,
      setIsContactModalOpen: state.setIsContactModalOpen
    }))
  );

  const { data: currentUser } = useGetUserPersonalDetails();

  const formik = useFormik<CrmContactEntity>({
    initialValues: {
      name: "",
      email: "",
      contactNumber: "",
      companyId: undefined,
      ownerId: currentUser?.employeeId
        ? Number(currentUser.employeeId)
        : undefined
    },
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

    if (createdContact.id) {
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
    createNewContact({
      name: values.name?.trim(),
      email: values.email?.trim(),
      contactNumber: values.contactNumber?.trim(),
      companyId: values.companyId,
      companyName: values.companyName?.trim(),
      ownerId: values.ownerId
    });
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
