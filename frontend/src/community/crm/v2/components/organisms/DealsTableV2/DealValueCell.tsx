import { InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, KeyboardEvent } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import useInlineEditForm from "~community/crm/hooks/useInlineEditForm";
import { formatCurrency } from "~community/crm/v2/utils/commonUtil";
import { validateDealAmount } from "~community/crm/v2/utils/dealValidations";

import EditableCell from "./EditableCell";

interface Props {
  amount?: string;
  onSave: (amount: string) => void;
}

const DealValueCell: FC<Props> = ({ amount, onSave }) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");

  const { isEditing, value, error, startEditing, changeValue, save, discard } =
    useInlineEditForm({
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
      ariaLabel={translateText(["inlineEdit", "ariaLabels", "value"])}
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
        placeholder={translateText(["inlineEdit", "placeholders", "none"])}
        className="w-full"
        variant="sm"
        type="text"
        state={error ? "error" : "default"}
        errorMessage={error}
        aria-label={translateText(["inlineEdit", "ariaLabels", "value"])}
        autoFocus
      />
    </EditableCell>
  );
};

export default DealValueCell;
