import {
  Avatar,
  CloseIcon,
  InputField,
  SearchIcon,
  SmallModal
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateContact } from "~community/crm/api/CrmContactsApi";
import { ContactDetail } from "~community/crm/types/CommonTypes";
import {
  EditContactFormValues,
  validateEditContactForm
} from "~community/crm/utils/editContactValidation";

import styles from "./styles";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contact: ContactDetail;
}

const EditContactModal: FC<Props> = ({ isOpen, onClose, contact }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );
  const { setToastMessage } = useToast();

  const { mutate: updateContact, isPending } = useUpdateContact({
    onSuccess: () => {
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateText(["editContactModal", "successTitle"]),
        description: translateText(["editContactModal", "successDescription"]),
        isIcon: true
      });
      onClose();
    },
    onError: (message: string) => {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["editContactModal", "errorTitle"]),
        description: message,
        isIcon: true
      });
    }
  });

  const formik = useFormik<EditContactFormValues>({
    initialValues: {
      name: contact.name,
      email: contact.email,
      contactNumber: contact.contactNumber ?? ""
    },
    enableReinitialize: true,
    validate: (values) => validateEditContactForm(values, translateText),
    onSubmit: (values) => {
      updateContact({
        id: contact.id,
        payload: {
          name: values.name.trim(),
          email: values.email.trim(),
          contactNumber: values.contactNumber.trim() || null
        }
      });
    }
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={handleClose}
      modalHeader={translateText(["editContactModal", "title"])}
      backdropVariant="dark"
      content={
        <form
          id="edit-contact-form"
          onSubmit={formik.handleSubmit}
          className={styles.form}
        >
          {/* Contact name */}
          <InputField
            label={translateText(["editContactModal", "nameLabel"])}
            required
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            state={
              formik.touched.name && formik.errors.name ? "error" : "default"
            }
            errorMessage={formik.touched.name ? formik.errors.name : undefined}
            fullWidth
          />

          {/* Email */}
          <InputField
            label={translateText(["editContactModal", "emailLabel"])}
            required
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            state={
              formik.touched.email && formik.errors.email ? "error" : "default"
            }
            errorMessage={
              formik.touched.email ? formik.errors.email : undefined
            }
            fullWidth
          />

          {/* Company — read-only until company search API is available */}
          {contact.company && (
            <InputField
              label={translateText(["editContactModal", "companyLabel"])}
              value={contact.company.name}
              readOnly
              rightIcon={<SearchIcon />}
              fullWidth
            />
          )}

          {/* Contact number */}
          <InputField
            label={translateText(["editContactModal", "contactNoLabel"])}
            name="contactNumber"
            value={formik.values.contactNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
          />

          {/* Contact owner — display only */}
          <div className={styles.ownerRow}>
            <span className={styles.ownerLabel}>
              {translateText(["editContactModal", "ownerLabel"])}
            </span>
            <div className={styles.ownerInputArea}>
              <div className={styles.ownerChip}>
                <Avatar
                  id={`edit-contact-owner-${contact.id}`}
                  size="xs"
                  firstName={contact.owner.firstName}
                  lastName={contact.owner.lastName ?? ""}
                  src={contact.owner.authPic ?? undefined}
                />
                <span className={styles.ownerName}>
                  {contact.owner.firstName} {contact.owner.lastName ?? ""}
                </span>
              </div>
            </div>
          </div>
        </form>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          children: translateText(["editContactModal", "discardBtn"]),
          icon: <CloseIcon />,
          iconPosition: "end",
          onClick: handleClose,
          disabled: isPending
        },
        buttonRight: {
          variant: "primary",
          children: translateText(["editContactModal", "saveBtn"]),
          onClick: () => formik.handleSubmit(),
          isLoading: isPending,
          disabled: isPending || !formik.dirty
        }
      }}
    />
  );
};

export default EditContactModal;
