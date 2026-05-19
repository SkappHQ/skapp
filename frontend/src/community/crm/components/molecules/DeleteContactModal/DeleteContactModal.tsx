import { CloseIcon, SmallModal, TrashIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useDeleteContact } from "~community/crm/api/CrmContactsApi";
import { CrmContactType } from "~community/crm/types/CommonTypes";

import styles from "./styles";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contact: CrmContactType;
  onDeleted: () => void;
}

const DeleteContactModal: FC<Props> = ({
  isOpen,
  onClose,
  contact,
  onDeleted
}) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );
  const { setToastMessage } = useToast();

  const { mutate: deleteContact, isPending } = useDeleteContact(
    () => {
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateText(["deleteContactModal", "successTitle"]),
        description: translateText([
          "deleteContactModal",
          "successDescription"
        ]),
        isIcon: true
      });
      onDeleted();
    },
    () => {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["deleteContactModal", "errorTitle"]),
        description: translateText(["deleteContactModal", "errorDescription"]),
        isIcon: true
      });
    }
  );

  const description = translateText([
    "deleteContactModal",
    "description"
  ]).replace("{{name}}", contact.name);

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["deleteContactModal", "title"])}
      backdropVariant="dark"
      className="w-[553px] !rounded-2xl"
      content={<p className={styles.description}>{description}</p>}
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          children: translateText(["deleteContactModal", "cancelBtn"]),
          icon: <CloseIcon />,
          iconPosition: "end",
          onClick: onClose,
          disabled: isPending
        },
        buttonRight: {
          variant: "error",
          children: translateText(["deleteContactModal", "deleteBtn"]),
          icon: <TrashIcon />,
          iconPosition: "end",
          onClick: () => deleteContact(contact.id),
          isLoading: isPending,
          disabled: isPending
        }
      }}
    />
  );
};

export default DeleteContactModal;
