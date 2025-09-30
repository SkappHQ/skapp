"use client";

import { Box, Stack, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import Button from "~community/common/components/atoms/Button/Button";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { MultiStepSignUpLayout } from "~enterprise/common/components/templates/MultiStepSignUpLayout/MultiStepSignUpLayout";
import { useSignUpFlow } from "~enterprise/common/hooks/useSignUpFlow";
import InputField from "~community/common/components/molecules/InputField/InputField";

export default function VerifyAccount() {
  const translateText = useTranslator("onboarding", "organizationCreate");
  const router = useRouter();
  const { navigateBack } = useSignUpFlow();
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Start countdown timer for resend email
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerificationCodeChange = (value: string) => {
    setVerificationCode(value);
    if (error) setError("");
  };

  const handleVerifyAccount = () => {
    if (!verificationCode.trim()) {
      setError("Verification code is required");
      return;
    }

    if (verificationCode.length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    // Handle account verification
    console.log("Verifying account with code:", verificationCode);
    // Navigate to dashboard or success page
    router.push("/dashboard");
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // Handle resend email logic
      console.log("Resending verification email");
      setCountdown(60); // 60 second countdown
    } catch (error) {
      console.error("Failed to resend email:", error);
    } finally {
      setIsResending(false);
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
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Enter the 6-digit code we sent to your email address to complete your account setup.
          </Typography>
        </Box>

        <InputField
          label="Verification Code"
          placeholder="Enter 6-digit code"
          value={verificationCode}
          onChange={handleVerificationCodeChange}
          error={!!error}
          helperText={error}
          required
          inputProps={{
            maxLength: 6,
            pattern: "[0-9]*",
            inputMode: "numeric"
          }}
        />

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Didn't receive the email?
          </Typography>
          <Button
            label={
              countdown > 0 
                ? `Resend in ${countdown}s` 
                : "Resend verification email"
            }
            buttonStyle={ButtonStyle.TERTIARY}
            onClick={handleResendEmail}
            disabled={isResending || countdown > 0}
            size="small"
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            label="Back"
            buttonStyle={ButtonStyle.TERTIARY}
            onClick={handleBack}
            fullWidth
          />
          <Button
            label="Verify Account"
            buttonStyle={ButtonStyle.PRIMARY}
            onClick={handleVerifyAccount}
            fullWidth
          />
        </Box>
      </Stack>
    </MultiStepSignUpLayout>
  );
}