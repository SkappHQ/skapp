import {
  CloseIcon,
  IconButton,
  InputField,
  TickIcon
} from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEventHandler } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/commonConstants";
import useInlineEditForm from "~community/crm/hooks/useInlineEditForm";
import { useCheckDealNameExists } from "~community/crm/v2/api/CrmDealApi";
import { validateDealName } from "~community/crm/v2/utils/dealValidations";

interface DealTitleSectionProps {
  name: string;
  onSave: (name: string) => void;
}

const DealTitleSection: FC<DealTitleSectionProps> = ({ name, onSave }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const {
    isEditing,
    value: editedTitle,
    error,
    startEditing,
    changeValue,
    save,
    discard
  } = useInlineEditForm({
    value: name,
    validate: (value) => validateDealName(value, translateText),
    onSave
  });

  const trimmedTitle = editedTitle.trim();
  const debouncedDealName = useDebounce(trimmedTitle, SEARCH_DEBOUNCE_DELAY);

  const isDealNameCheckEnabled =
    isEditing &&
    debouncedDealName.length > 0 &&
    debouncedDealName !== name.trim();

  const { data: dealNameData } = useCheckDealNameExists(
    debouncedDealName,
    isDealNameCheckEnabled
  );
  const isDuplicateName =
    trimmedTitle !== name.trim() && (dealNameData?.isExists ?? false);

  const nameErrorMessage = isDuplicateName
    ? translateText(["validations", "dealNameExists"])
    : error;

  const handleSave = () => {
    if (isDuplicateName) return;
    save();
  };

  const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  const handleTitleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      startEditing();
    }
  };

  if (isEditing) {
    return (
      <div className="flex gap-6 items-center min-w-0">
        <div className="flex-1 min-w-0 p-1">
          <InputField
            value={editedTitle}
            onChange={(e) => changeValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full"
            state={nameErrorMessage ? "error" : "default"}
            errorMessage={nameErrorMessage}
            autoFocus
          />
        </div>
        <div className="w-1/3 shrink-0 flex justify-start items-center">
          <div className="flex gap-2">
            <IconButton
              aria-label={translateText(["ariaLabels", "saveTitle"])}
              isRounded
              icon={<TickIcon fill="var(--color-primary-accent)" />}
              onClick={handleSave}
              variant="outlined"
            />
            <IconButton
              aria-label={translateText(["ariaLabels", "discardTitle"])}
              isRounded
              icon={<CloseIcon />}
              onClick={discard}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-center min-w-0">
      <div className="flex-1 min-w-0">
        <div
          role="button"
          tabIndex={0}
          className="h2 text-left w-full cursor-pointer hover:bg-secondary-background py-1 rounded bg-transparent border-none"
          aria-label={translateText(["ariaLabels", "editTitle"])}
          onClick={startEditing}
          onKeyDown={handleTitleKeyDown}
        >
          {name}
        </div>
      </div>
    </div>
  );
};

export default DealTitleSection;
