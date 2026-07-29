import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUnassignLeavePolicy } from "~community/leave/api/LeavePolicyAssignmentApi";
import { EmployeeLeavePolicyType } from "~community/leave/types/LeavePolicyTypes";

interface Props {
  employeeLeavePolicy: EmployeeLeavePolicyType | null;
  employeeName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const UnassignLeavePolicyModal: FC<Props> = ({
  employeeLeavePolicy,
  employeeName,
  isOpen,
  onClose
}) => {
  const translateText = useTranslator("leaveModule", "leavePolicyAssignment");
  const { setToastMessage } = useToast();

  const onUnassignSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["unassignSuccessTitle"]),
      description: translateText(["unassignSuccessDescription"], {
        policyName: employeeLeavePolicy?.policyName ?? ""
      }),
      isIcon: true
    });
    onClose();
  };

  const onUnassignError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["errorTitle"]),
      description: translateText(["unassignErrorDescription"]),
      isIcon: true
    });
  };

  const { mutate: unassignLeavePolicy, isPending } = useUnassignLeavePolicy(
    employeeLeavePolicy?.employeeId ?? 0,
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
      modalHeader={translateText(["unassignModal", "title"])}
      content={
        <div className="flex flex-col gap-3">
          <p className="body1 text-black">
            {translateText(["unassignModal", "descriptionIntro"])}
          </p>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li className="body1 text-secondary-text">
              {translateText(["unassignModal", "descriptionEntitlement"], {
                employeeName: employeeName ?? "",
                leaveType: employeeLeavePolicy.leaveTypeName
              })}
            </li>
            <li className="body1 text-secondary-text">
              {translateText(["unassignModal", "descriptionBalance"])}
            </li>
          </ul>
        </div>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: onClose,
          disabled: isPending,
          children: translateText(["unassignModal", "cancelBtnTxt"])
        },
        buttonRight: {
          variant: "error",
          onClick: handleUnassign,
          disabled: isPending,
          isLoading: isPending,
          children: translateText(["unassignModal", "unassignBtnTxt"])
        }
      }}
    />
  );
};

export default UnassignLeavePolicyModal;
