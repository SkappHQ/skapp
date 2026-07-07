import { SmallModal } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useDeleteDeal } from "~community/crm/api/crmDealApi";
import { useCrmStore } from "~community/crm/store/store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dealId: number;
  dealName: string;
}

const DeleteDealModal = ({ isOpen, onClose, dealId, dealName }: Props) => {
  const translateText = useTranslator("crmModule", "deals", "deleteDealModal");
  const { setToastMessage } = useToast();

  const { setSelectedDealId, closeCrmSidePanel } = useCrmStore((store) => ({
    setSelectedDealId: store.setSelectedDealId,
    closeCrmSidePanel: store.closeCrmSidePanel
  }));

  const handleSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"], {
        dealName
      })
    });

    onClose();
    closeCrmSidePanel();
    setSelectedDealId(null);
  };

  const handleError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText(["toastMessages", "errorDescription"])
    });
  };

  const { mutate: deleteDeal, isPending } = useDeleteDeal(
    handleSuccess,
    handleError
  );

  const handleDeleteDeal = (): void => {
    deleteDeal(dealId);
  };

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["areYouSureModalTitle"])}
      content={
        <p>
          {translateText(["description"], {
            dealName
          })}
        </p>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: onClose,
          icon: <Icon name={IconName.CLOSE_ICON} />,
          iconPosition: "end",
          disabled: isPending,
          children: translateText(["buttons", "cancel"])
        },
        buttonRight: {
          variant: "error",
          onClick: handleDeleteDeal,
          icon: (
            <Icon
              name={IconName.DELETE_BUTTON_ICON}
              fill="var(--color-semantic-red-text)"
            />
          ),
          iconPosition: "end",
          isLoading: isPending,
          disabled: isPending,
          children: translateText(["buttons", "confirm"])
        }
      }}
    />
  );
};

export default DeleteDealModal;
