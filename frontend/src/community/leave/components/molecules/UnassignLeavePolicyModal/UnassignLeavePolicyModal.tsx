import { SmallModal } from "@rootcodelabs/skapp-ui";
import { AxiosError } from "axios";
import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { getEmoji } from "~community/common/utils/commonUtil";
import { useUnassignLeavePolicy } from "~community/leave/api/LeavePolicyAssignmentApi";
import { EmployeeLeavePolicyType } from "~community/leave/types/LeavePolicyTypes";

interface Props {
  employeeLeavePolicy: EmployeeLeavePolicyType | null;
  isOpen: boolean;
  onClose: () => void;
}

const UnassignLeavePolicyModal: FC<Props> = ({
  employeeLeavePolicy,
  isOpen,
  onClose
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicyAssignment",
    "unassignModal"
  );
  const translateSectionText = useTranslator(
    "leaveModule",
    "leavePolicyAssignment"
  );
  const { setToastMessage } = useToast();

  const onUnassignSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateSectionText(["unassignSuccessTitle"]),
      description: translateSectionText(["unassignSuccessDescription"], {
        policyName: employeeLeavePolicy?.policyName ?? ""
      }),
      isIcon: true
    });
    onClose();
  };

  const onUnassignError = (_error: AxiosError): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateSectionText(["errorTitle"]),
      description: translateSectionText(["unassignErrorDescription"]),
      isIcon: true
    });
  };

  const { mutate: unassignLeavePolicy, isPending } = useUnassignLeavePolicy(
    onUnassignSuccess,
    onUnassignError
  );

  const handleUnassign = (): void => {
    if (!employeeLeavePolicy) {
      return;
    }
    unassignLeavePolicy({
      employeeId: employeeLeavePolicy.employeeId,
      policyId: employeeLeavePolicy.policyId
    });
  };

  if (!employeeLeavePolicy) {
    return null;
  }

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["title"])}
      content={
        <div className="flex flex-col gap-3">
          <span className="body2 inline-flex items-center gap-2 text-secondary-text">
            {employeeLeavePolicy.leaveTypeEmojiCode && (
              <span role="img" aria-hidden="true">
                {getEmoji(employeeLeavePolicy.leaveTypeEmojiCode)}
              </span>
            )}
            {employeeLeavePolicy.leaveTypeName}
          </span>
          <p className="body1 text-secondary-text">
            {translateText(["description"])}
          </p>
        </div>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: onClose,
          disabled: isPending,
          children: translateText(["cancelBtnTxt"])
        },
        buttonRight: {
          variant: "error",
          onClick: handleUnassign,
          disabled: isPending,
          isLoading: isPending,
          children: translateText(["unassignBtnTxt"])
        }
      }}
    />
  );
};

export default UnassignLeavePolicyModal;
