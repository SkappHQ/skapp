import { ButtonV2, CloseIcon, SaveIcon, Toggle } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import EnableLeavePoliciesConfirmModal from "~community/configurations/components/molecules/EnableLeavePoliciesConfirmModal/EnableLeavePoliciesConfirmModal";

const LeaveConfigurations: FC = () => {
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

  const handleCloseEnableConfirmModal = () =>
    setIsEnableConfirmModalOpen(false);

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

      <EnableLeavePoliciesConfirmModal
        isOpen={isEnableConfirmModalOpen}
        onClose={handleCloseEnableConfirmModal}
        onConfirm={handleConfirmEnable}
      />
    </div>
  );
};

export default LeaveConfigurations;
