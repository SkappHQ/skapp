import { FormikErrors, FormikTouched } from "formik";
import { FC } from "react";

import {
  LeavePolicyFormData,
  LeavePolicyWizardSteps
} from "~community/leave/types/LeavePolicyTypes";

import BasicInfoStep from "./BasicInfoStep";
import EntitlementSetupStep from "./EntitlementSetupStep";
import SummaryStep from "./SummaryStep";

interface Props {
  activeStep: LeavePolicyWizardSteps;
  isAccrual: boolean;
  formData: LeavePolicyFormData;
  errors: FormikErrors<LeavePolicyFormData>;
  touched: FormikTouched<LeavePolicyFormData>;
  onChange: (values: Partial<LeavePolicyFormData>) => void;
  onEditFromSummary: (step: LeavePolicyWizardSteps) => void;
}

const LeavePolicyStepContent: FC<Props> = ({
  activeStep,
  isAccrual,
  formData,
  errors,
  touched,
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
        touched={touched}
      />
    );
  }

  return (
    <BasicInfoStep
      formData={formData}
      onChange={onChange}
      errors={errors}
      touched={touched}
    />
  );
};

export default LeavePolicyStepContent;
