import { useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateNewContact } from "~community/crm/api/ContactApi";
import ContactModalForm from "~community/crm/components/molecules/ContactModalForm/ContactModalForm";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactCreatePayload,
  CrmContactFormValues,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

const AddContactModalContent = () => {
  const { setToastMessage } = useToast();
  const translateContactText = useTranslator(
    "crmModule",
    "contacts",
    "addContactModal"
  );
  const { data: currentUser } = useGetUserPersonalDetails();
  const { setIsContactModalOpen } = useCrmStore((store) => ({
    setIsContactModalOpen: store.setIsContactModalOpen
  }));

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
  };

  const { mutate: createNewContact, isPending } = useCreateNewContact(
    () => {
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

  const initialOwner = useMemo<CrmOwner | null>(
    () =>
      currentUser
        ? {
            employeeId: Number(currentUser.employeeId),
            firstName: currentUser.firstName ?? "",
            lastName: currentUser.lastName ?? null,
            authPic: currentUser.authPic as string | null
          }
        : null,
    [currentUser]
  );

  const initialValues: CrmContactFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    companyId: null,
    ownerId: initialOwner?.employeeId ?? null
  };

  const createContact = (values: CrmContactFormValues) => {
    const payload: CrmContactCreatePayload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim() || null,
      email: values.email.trim(),
      contactNumber: values.contactNumber.trim() || undefined,
      companyId: values.companyId ?? undefined,
      ownerId: values.ownerId ?? undefined
    };

    createNewContact(payload);
  };

  return (
    <ContactModalForm
      translateContactText={translateContactText}
      initialValues={initialValues}
      initialOwner={initialOwner}
      isPending={isPending}
      onSubmit={createContact}
      onCancel={handleCloseModal}
    />
  );
};

export default AddContactModalContent;
