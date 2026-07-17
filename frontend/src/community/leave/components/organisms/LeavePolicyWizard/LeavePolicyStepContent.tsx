import { FC } from "react";

import {
  LeavePolicyFormData,
  LeavePolicyWizardErrors,
  LeavePolicyWizardSteps
} from "~community/leave/types/LeavePolicyTypes";

import BasicInfoStep from "./BasicInfoStep";
import EntitlementSetupStep from "./EntitlementSetupStep";
import SummaryStep from "./SummaryStep";

interface Props {
  activeStep: LeavePolicyWizardSteps;
  isAccrual: boolean;
  formData: LeavePolicyFormData;
  errors: LeavePolicyWizardErrors;
  onChange: (values: Partial<LeavePolicyFormData>) => void;
  onEditFromSummary: (step: LeavePolicyWizardSteps) => void;
}

const LeavePolicyStepContent: FC<Props> = ({
  activeStep,
  isAccrual,
  formData,
  errors,
  onChange,
  onEditFromSummary
}) => {
  if (isAccrual && activeStep === LeavePolicyWizardSteps.SUMMARY) {
    return <SummaryStep formData={formData} onEdit={onEditFromSummary} />;
  }

  if (isAccrual && activeStep === LeavePolicyWizardSteps.ENTITLEMENT_SETUP) {
    return (
      <EntitlementSetupStep
        formData={formData}
        onChange={onChange}
        errors={errors}
      />
    );
  }

  return (
    <BasicInfoStep formData={formData} onChange={onChange} errors={errors} />
  );
};

export default LeavePolicyStepContent;
