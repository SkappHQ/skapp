"use client";

import { Box, Stack, Typography } from "@mui/material";
import { useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import InputField from "~community/common/components/atoms/InputField/InputField";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { MultiStepSignUpLayout } from "~enterprise/common/components/templates/MultiStepSignUpLayout/MultiStepSignUpLayout";
import { useSignUpFlow } from "~enterprise/common/hooks/useSignUpFlow";

interface OrganizationData {
  organizationName: string;
  industry: string;
  companySize: string;
}

export default function OrganizationSetup() {
  const translateText = useTranslator("onboarding", "organizationCreate");
  const { navigateToStep, navigateBack } = useSignUpFlow();
  const [formData, setFormData] = useState<OrganizationData>({
    organizationName: "",
    industry: "",
    companySize: ""
  });
  const [errors, setErrors] = useState<Partial<OrganizationData>>({});

  const handleInputChange = (field: keyof OrganizationData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<OrganizationData> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }

    if (!formData.industry.trim()) {
      newErrors.industry = "Industry is required";
    }

    if (!formData.companySize.trim()) {
      newErrors.companySize = "Company size is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Handle organization setup submission
      console.log("Organization setup:", formData);
      // Navigate to next step (email verification)
      navigateToStep('verify-account');
    }
  };

  const handleBack = () => {
    navigateBack();
  };

  return (
    <MultiStepSignUpLayout
      showSignInLink={{ visible: true, position: "top" }}
    >
      <Stack spacing={3} sx={{ width: "100%" }}>
        <InputField
          label="Organization Name"
          placeholder="Enter your organization name"
          value={formData.organizationName}
          onChange={handleInputChange("organizationName")}
          error={!!errors.organizationName}
          helperText={errors.organizationName}
          required
        />

        <InputField
          label="Industry"
          placeholder="Select your industry"
          value={formData.industry}
          onChange={handleInputChange("industry")}
          error={!!errors.industry}
          helperText={errors.industry}
          required
        />

        <InputField
          label="Company Size"
          placeholder="Select company size"
          value={formData.companySize}
          onChange={handleInputChange("companySize")}
          error={!!errors.companySize}
          helperText={errors.companySize}
          required
        />

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            label="Back"
            buttonStyle={ButtonStyle.TERTIARY}
            onClick={handleBack}
            fullWidth
          />
          <Button
            label="Continue"
            buttonStyle={ButtonStyle.PRIMARY}
            onClick={handleSubmit}
            fullWidth
          />
        </Box>
      </Stack>
    </MultiStepSignUpLayout>
  );
}