import { InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, KeyboardEvent } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import useInlineEditForm from "~community/crm/hooks/useInlineEditForm";
import EditableCell from "~community/crm/v2/components/molecules/EditableCell/EditableCell";
import { formatCurrency } from "~community/crm/v2/utils/commonUtil";
import { validateDealAmount } from "~community/crm/v2/utils/dealValidations";

interface Props {
  amount?: string;
  onSave: (amount: string) => void;
}

const DealValueCell: FC<Props> = ({ amount, onSave }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const {
    isEditing,
    value,
    error,
    startEditing,
    changeValue,
    save,
    discard
  } = useInlineEditForm({
    value: amount ?? "",
    validate: (nextValue) => validateDealAmount(nextValue, translateText),
    onSave
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    changeValue(event.target.value);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      save();
    } else if (event.key === "Escape") {
      discard();
    }
  };

  return (
    <EditableCell
      isEditing={isEditing}
      ariaLabel={translateText(["ariaLabels", "amount"])}
      onStartEditing={startEditing}
      onClickOutside={save}
      display={
        <span className="body2 w-full block text-right">
          {formatCurrency(amount)}
        </span>
      }
    >
      <InputField
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={translateText(["placeholders", "none"])}
        className="w-full"
        variant="sm"
        type="text"
        state={error ? "error" : "default"}
        errorMessage={error}
        aria-label={translateText(["ariaLabels", "amount"])}
        autoFocus
      />
    </EditableCell>
  );
};

export default DealValueCell;
