import { ButtonV2, CloseIcon, DeleteButtonIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

interface Props {
  description: string;
  isPending: boolean;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

const CrmDeleteModalContent: FC<Props> = ({
  description,
  isPending,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose
}) => {
  return (
    <div className="flex flex-col">
      <div>{description}</div>
      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          onClick={onClose}
          icon={<CloseIcon />}
          iconPosition="end"
          disabled={isPending}
        >
          {cancelLabel}
        </ButtonV2>
        <ButtonV2
          variant="error"
          type="button"
          icon={
            <DeleteButtonIcon
              height="12px"
              width="9.33px"
              fill="var(--color-semantic-red-text)"
            />
          }
          isLoading={isPending}
          iconPosition="end"
          onClick={onConfirm}
          disabled={isPending}
        >
          {confirmLabel}
        </ButtonV2>
      </div>
    </div>
  );
};

export default CrmDeleteModalContent;
