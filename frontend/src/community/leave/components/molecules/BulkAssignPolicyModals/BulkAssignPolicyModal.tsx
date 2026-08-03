import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import BulkAssignPolicyInstructionsStep from "~community/leave/components/molecules/BulkAssignPolicyModals/BulkAssignPolicyInstructionsStep";
import BulkAssignPolicySummaryStep from "~community/leave/components/molecules/BulkAssignPolicyModals/BulkAssignPolicySummaryStep";
import BulkAssignPolicyUploadStep from "~community/leave/components/molecules/BulkAssignPolicyModals/BulkAssignPolicyUploadStep";
import { BulkAssignPolicyResponse } from "~community/leave/types/LeavePolicyTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

enum BulkAssignStep {
  INSTRUCTIONS = "INSTRUCTIONS",
  UPLOAD = "UPLOAD",
  SUMMARY = "SUMMARY"
}

const BulkAssignPolicyModal: FC<Props> = ({ isOpen, onClose }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "bulkAssignModal"
  );

  const [step, setStep] = useState<BulkAssignStep>(BulkAssignStep.INSTRUCTIONS);
  const [response, setResponse] = useState<BulkAssignPolicyResponse | null>(
    null
  );

  const handleClose = (): void => {
    setStep(BulkAssignStep.INSTRUCTIONS);
    setResponse(null);
    onClose();
  };

  const handleComplete = (result: BulkAssignPolicyResponse): void => {
    setResponse(result);
    setStep(BulkAssignStep.SUMMARY);
  };

  const modalHeader =
    step === BulkAssignStep.INSTRUCTIONS
      ? translateText(["addPoliciesTitle"])
      : translateText(["title"]);

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={handleClose}
      modalHeader={modalHeader}
      content={
        step === BulkAssignStep.INSTRUCTIONS ? (
          <BulkAssignPolicyInstructionsStep
            onContinue={() => setStep(BulkAssignStep.UPLOAD)}
          />
        ) : step === BulkAssignStep.UPLOAD ? (
          <BulkAssignPolicyUploadStep
            onComplete={handleComplete}
            onBack={() => setStep(BulkAssignStep.INSTRUCTIONS)}
          />
        ) : response ? (
          <BulkAssignPolicySummaryStep
            response={response}
            onDone={handleClose}
          />
        ) : null
      }
    />
  );
};

export default BulkAssignPolicyModal;
