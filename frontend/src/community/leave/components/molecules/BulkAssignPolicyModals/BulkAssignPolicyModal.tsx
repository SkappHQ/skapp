import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import BulkAssignPolicyInstructionsStep from "~community/leave/components/molecules/BulkAssignPolicyModals/BulkAssignPolicyInstructionsStep";
import BulkAssignPolicySummaryStep from "~community/leave/components/molecules/BulkAssignPolicyModals/BulkAssignPolicySummaryStep";
import BulkAssignPolicyUploadStep from "~community/leave/components/molecules/BulkAssignPolicyModals/BulkAssignPolicyUploadStep";
import {
  BulkAssignPolicyResponse,
  BulkAssignPolicySteps
} from "~community/leave/types/LeavePolicyTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const BulkAssignPolicyModal: FC<Props> = ({ isOpen, onClose }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "bulkAssignModal"
  );

  const [step, setStep] = useState<BulkAssignPolicySteps>(
    BulkAssignPolicySteps.INSTRUCTIONS
  );
  const [assignmentResult, setAssignmentResult] =
    useState<BulkAssignPolicyResponse | null>(null);

  const handleClose = (): void => {
    setStep(BulkAssignPolicySteps.INSTRUCTIONS);
    setAssignmentResult(null);
    onClose();
  };

  const handleAssignmentComplete = (result: BulkAssignPolicyResponse): void => {
    setAssignmentResult(result);
    setStep(BulkAssignPolicySteps.SUMMARY);
  };

  const getModalContent = (): ReactNode => {
    switch (step) {
      case BulkAssignPolicySteps.INSTRUCTIONS:
        return (
          <BulkAssignPolicyInstructionsStep
            onContinue={() => setStep(BulkAssignPolicySteps.UPLOAD)}
          />
        );
      case BulkAssignPolicySteps.UPLOAD:
        return (
          <BulkAssignPolicyUploadStep
            onComplete={handleAssignmentComplete}
            onBack={() => setStep(BulkAssignPolicySteps.INSTRUCTIONS)}
          />
        );
      default:
        return assignmentResult ? (
          <BulkAssignPolicySummaryStep
            assignmentResult={assignmentResult}
            onDone={handleClose}
          />
        ) : null;
    }
  };

  const modalHeader =
    step === BulkAssignPolicySteps.INSTRUCTIONS
      ? translateText(["addPoliciesTitle"])
      : translateText(["title"]);

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={handleClose}
      modalHeader={modalHeader}
      content={getModalContent()}
    />
  );
};

export default BulkAssignPolicyModal;
