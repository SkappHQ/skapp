import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import BulkAssignPolicySummaryStep from "~community/leave/components/molecules/BulkAssignPolicyModals/BulkAssignPolicySummaryStep";
import BulkAssignPolicyUploadStep from "~community/leave/components/molecules/BulkAssignPolicyModals/BulkAssignPolicyUploadStep";
import { BulkAssignPolicyResponse } from "~community/leave/types/LeavePolicyTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

enum BulkAssignStep {
  UPLOAD = "UPLOAD",
  SUMMARY = "SUMMARY"
}

const BulkAssignPolicyModal: FC<Props> = ({ isOpen, onClose }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "bulkAssignModal"
  );

  const [step, setStep] = useState<BulkAssignStep>(BulkAssignStep.UPLOAD);
  const [response, setResponse] = useState<BulkAssignPolicyResponse | null>(
    null
  );

  const handleClose = (): void => {
    setStep(BulkAssignStep.UPLOAD);
    setResponse(null);
    onClose();
  };

  const handleComplete = (result: BulkAssignPolicyResponse): void => {
    setResponse(result);
    setStep(BulkAssignStep.SUMMARY);
  };

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={handleClose}
      modalHeader={translateText(["title"])}
      content={
        step === BulkAssignStep.UPLOAD ? (
          <BulkAssignPolicyUploadStep onComplete={handleComplete} />
        ) : (
          <BulkAssignPolicySummaryStep
            response={response}
            onDone={handleClose}
          />
        )
      }
    />
  );
};

export default BulkAssignPolicyModal;
