import { Tooltip } from "@mui/material";
import { Toggle } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { FC, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import EnableLeavePoliciesConfirmModal from "~community/configurations/components/molecules/EnableLeavePoliciesConfirmModal/EnableLeavePoliciesConfirmModal";
import LeaveApprovalSettings from "~community/configurations/components/organisms/LeaveApprovalSettings/LeaveApprovalSettings";
import { useEnableLeavePolicies } from "~community/leave/api/LeavePolicyApi";
import useCanManageLeavePolicies from "~community/leave/hooks/useCanManageLeavePolicies";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";

const LeaveConfigurations: FC = () => {
  const translateText = useTranslator("configurations", "leave");
  const router = useRouter();
  const { setToastMessage } = useToast();

  const canManageLeavePolicies = useCanManageLeavePolicies();
  const { isPeopleAdmin } = useSessionData();
  const { isLeavePoliciesEnabled, isLoading, isError } =
    useLeavePoliciesEnabled();

  const [isToggleOn, setIsToggleOn] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const onEnableSuccess = (): void => {
    setIsConfirmModalOpen(false);
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toasts", "successTitle"]),
      description: translateText(["toasts", "successDescription"]),
      isIcon: true
    });
    router.push(ROUTES.LEAVE.LEAVE_POLICIES);
  };

  const onEnableError = (): void => {
    setIsConfirmModalOpen(false);
    setIsToggleOn(false);

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toasts", "errorTitle"]),
      description: translateText(["toasts", "errorDescription"]),
      isIcon: true
    });
  };

  const { mutate: enableLeavePolicies, isPending } = useEnableLeavePolicies(
    onEnableSuccess,
    onEnableError
  );

  if (isLoading || isError) {
    return null;
  }

  const handleToggleChange = (checked: boolean): void => {
    if (!checked) {
      return;
    }
    setIsToggleOn(true);
    setIsConfirmModalOpen(true);
  };

  const handleCloseModal = (): void => {
    if (isPending) {
      return;
    }
    setIsConfirmModalOpen(false);
    setIsToggleOn(false);
  };

  const handleConfirm = (): void => {
    enableLeavePolicies();
  };

  return (
    <div className="flex w-196 flex-col gap-6">
      {canManageLeavePolicies && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="subtitle2 text-black">
              {translateText(["leavePoliciesSection", "title"])}
            </h2>
            <p className="body1 text-secondary-text">
              {translateText(["leavePoliciesSection", "description"])}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="body1 text-secondary-text">
                {translateText(["leavePoliciesSection", "enableLabel"])}
              </p>
              <Tooltip
                title={translateText(["leavePoliciesSection", "infoTooltip"])}
                arrow
              >
                <span className="flex items-center">
                  <Icon name={IconName.INFORMATION_ICON} />
                </span>
              </Tooltip>
            </div>
            {isLeavePoliciesEnabled ? (
              <Toggle
                checked
                disabled
                onChange={handleToggleChange}
                ariaLabel={translateText([
                  "leavePoliciesSection",
                  "enableLabel"
                ])}
              />
            ) : (
              <Tooltip
                title={translateText([
                  "leavePoliciesSection",
                  "toggleOffTooltip"
                ])}
                arrow
              >
                <span className="flex items-center">
                  <Toggle
                    checked={isToggleOn}
                    onChange={handleToggleChange}
                    ariaLabel={translateText([
                      "leavePoliciesSection",
                      "enableLabel"
                    ])}
                  />
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      )}

      {isPeopleAdmin && isLeavePoliciesEnabled && <LeaveApprovalSettings />}

      <EnableLeavePoliciesConfirmModal
        isOpen={isConfirmModalOpen}
        isEnabling={isPending}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default LeaveConfigurations;
