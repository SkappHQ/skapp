import { useFormik } from "formik";
import { FC, useEffect } from "react";
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

  const translateText = useTranslator("crmModuleV2");

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
      ownerId: undefined
    },
    onSubmit: (values) => createContact(values),
    validationSchema: getContactValidationSchema(translateText),
    validateOnChange: false,
    validateOnBlur: true
  });

  const { setSubmitting, setFieldValue, values } = formik;

  useEffect(() => {
    if (currentUser?.employeeId && !values.ownerId) {
      setFieldValue("ownerId", Number(currentUser.employeeId));
    }
  }, [currentUser?.employeeId, values.ownerId, setFieldValue]);

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
      title: translateText([
        "contacts",
        "modal",
        "toastMessages",
        "addSuccessTitle"
      ]),
      description: translateText([
        "contacts",
        "modal",
        "toastMessages",
        "addSuccessDescription"
      ])
    });
  };

  const handleError = () => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "contacts",
        "modal",
        "toastMessages",
        "addErrorTitle"
      ]),
      description: translateText([
        "contacts",
        "modal",
        "toastMessages",
        "addErrorDescription"
      ])
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
      canAddNewCompany
      onCancel={handleCloseModal}
    />
  );
};

export default AddContactModalContent;
