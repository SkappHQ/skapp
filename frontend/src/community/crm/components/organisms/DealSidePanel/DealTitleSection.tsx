import {
  CloseIcon,
  IconButton,
  InputField,
  TickIcon
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC, KeyboardEventHandler, useState } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCheckDealNameExists } from "~community/crm/api/crmDealApi";
import { DEAL_NAME_DEBOUNCE_DELAY } from "~community/crm/constants/dealConstants";
import { dealTitleValidations } from "~community/crm/utils/dealValidations";

interface DealTitleSectionProps {
  name: string;
}

const DealTitleSection: FC<DealTitleSectionProps> = ({ name }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const translateValidationText = useTranslator(
    "crmModule",
    "deals",
    "addDealSidePanel"
  );

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: { name },
    validationSchema: dealTitleValidations(translateValidationText),
    validateOnChange: true,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: () => {
      // Edit API call
      setIsEditing(false);
    }
  });

  const debouncedDealName = useDebounce(
    formik.values.name.trim(),
    DEAL_NAME_DEBOUNCE_DELAY
  );

  const { data: dealNameData } = useCheckDealNameExists(
    debouncedDealName,
    isEditing &&
      debouncedDealName.length > 0 &&
      debouncedDealName !== name.trim()
  );

  const isNameUnchanged = formik.values.name.trim() === name.trim();

  const isDuplicateName = !isNameUnchanged && dealNameData?.isExists === true;

  const titleErrorMessage = isDuplicateName
    ? translateValidationText(["validations", "dealNameExists"])
    : formik.errors.name;

  const handleClick = () => {
    formik.resetForm({ values: { name } });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (isDuplicateName) return;
    formik.submitForm();
  };

  const handleDiscard = () => {
    formik.resetForm({ values: { name } });
    setIsEditing(false);
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
      handleClick();
    }
  };

  if (isEditing) {
    return (
      <div className="flex gap-6 items-center min-w-0">
        <div className="flex-1 min-w-0 p-1">
          <InputField
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onKeyDown={handleInputKeyDown}
            className="w-full"
            state={titleErrorMessage ? "error" : "default"}
            errorMessage={titleErrorMessage}
            autoFocus
          />
        </div>
        <div className="w-1/3 shrink-0 flex justify-start items-center">
          <div className="flex gap-2">
            <IconButton
              aria-label={translateText(["ariaLabels", "saveTitle"])}
              isRounded={true}
              icon={<TickIcon fill="var(--color-primary-accent)" />}
              onClick={handleSave}
              variant="outlined"
            />
            <IconButton
              aria-label={translateText(["ariaLabels", "discardTitle"])}
              isRounded={true}
              icon={<CloseIcon />}
              onClick={handleDiscard}
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
          onClick={handleClick}
          onKeyDown={handleTitleKeyDown}
        >
          {name}
        </div>
      </div>
    </div>
  );
};

export default DealTitleSection;
