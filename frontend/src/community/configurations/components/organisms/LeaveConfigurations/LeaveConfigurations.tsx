import {
  ButtonV2,
  CloseIcon,
  DeleteButtonIcon,
  SaveIcon,
  SmallModal,
  Toggle,
  YellowWarningIcon
} from "@rootcodelabs/skapp-ui";
import { JSX, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

const LeaveConfigurations = (): JSX.Element => {
  const translateText = useTranslator("configurations", "leave");

  const [isLeavePoliciesEnabled, setIsLeavePoliciesEnabled] = useState(false);
  const [initialValue, setInitialValue] = useState(false);
  const [isEnableConfirmModalOpen, setIsEnableConfirmModalOpen] =
    useState(false);

  const isFormChanged = isLeavePoliciesEnabled !== initialValue;

  const handleToggleChange = (checked: boolean) => {
    if (checked) {
      setIsEnableConfirmModalOpen(true);
      return;
    }
    setIsLeavePoliciesEnabled(false);
  };

  const handleCloseEnableConfirmModal = () => setIsEnableConfirmModalOpen(false);

  const handleConfirmEnable = () => {
    setIsLeavePoliciesEnabled(true);
    setIsEnableConfirmModalOpen(false);
  };

  const handleCancel = () => setIsLeavePoliciesEnabled(initialValue);
  const handleSave = () => setInitialValue(isLeavePoliciesEnabled);

  return (
    <div className="flex w-196 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="subtitle2 text-black">
          {translateText(["leavePoliciesSection", "title"])}
        </h2>
        <p className="body1 text-secondary-text">
          {translateText(["leavePoliciesSection", "description"])}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <p className="body1 text-secondary-text">
          {translateText(["leavePoliciesSection", "enableLabel"])}
        </p>
        <Toggle
          checked={isLeavePoliciesEnabled}
          onChange={handleToggleChange}
          ariaLabel={translateText(["leavePoliciesSection", "enableLabel"])}
        />
      </div>
      <div className="flex flex-row gap-4">
        <ButtonV2
          variant="tertiary"
          size="md"
          icon={<CloseIcon />}
          iconPosition="end"
          disabled={!isFormChanged}
          onClick={handleCancel}
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          size="md"
          icon={<SaveIcon />}
          iconPosition="end"
          disabled={!isFormChanged}
          onClick={handleSave}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>

      <SmallModal
        isOpen={isEnableConfirmModalOpen}
        onClose={handleCloseEnableConfirmModal}
        modalHeader={translateText(["enableConfirmModal", "title"])}
        content={
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-lg bg-semantic-amber-background px-4 py-3">
              <YellowWarningIcon className="size-4 shrink-0" />
              <p className="body2 text-black">
                <span className="font-medium">
                  {translateText(["enableConfirmModal", "warningTitle"])}
                </span>{" "}
                {translateText(["enableConfirmModal", "warningDescription"])}
              </p>
            </div>
            <div className="body1 text-black">
              <p>{translateText(["enableConfirmModal", "consequencesTitle"])}</p>
              <ul className="list-disc pl-6">
                <li>
                  {translateText([
                    "enableConfirmModal",
                    "consequenceDeleteAllocations"
                  ])}
                </li>
                <li>
                  {translateText([
                    "enableConfirmModal",
                    "consequenceRemoveBulkUpload"
                  ])}
                </li>
                <li>
                  {translateText([
                    "enableConfirmModal",
                    "consequenceRetainRecords"
                  ])}
                </li>
              </ul>
            </div>
          </div>
        }
        buttons={{
          buttonLeft: {
            variant: "tertiary",
            onClick: handleCloseEnableConfirmModal,
            icon: <CloseIcon />,
            iconPosition: "end",
            children: translateText(["buttons", "cancel"])
          },
          buttonRight: {
            variant: "error",
            onClick: handleConfirmEnable,
            icon: <DeleteButtonIcon fill="var(--color-semantic-red-text)" />,
            iconPosition: "end",
            children: translateText(["enableConfirmModal", "confirmButton"])
          }
        }}
      />
    </div>
  );
};

export default LeaveConfigurations;
