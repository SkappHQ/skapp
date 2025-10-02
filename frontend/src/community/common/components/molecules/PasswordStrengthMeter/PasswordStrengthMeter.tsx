import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import React, { useMemo } from "react";

import {
  PASSWORD_STRENGTH_MULTIPLIER,
  PasswordStrength
} from "~community/common/constants/stringConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  password: string;
  compact?: boolean;
  fontSize?: string;
  showStrengthText?: boolean;
}

interface Validations {
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  specialChar: boolean;
  length: boolean;
}

const PasswordStrengthMeter: React.FC<Props> = ({
  password,
  compact = false,
  fontSize = "0.875rem",
  showStrengthText = true
}) => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("onboarding", "resetPassword");

  const validatePassword = (password: string): Validations => ({
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>~'`\-_=+\\[\];]/.test(password),
    length: password.length >= 8
  });

  const validations = useMemo(() => validatePassword(password), [password]);

  const strengthScore = Object.values(validations).filter(Boolean).length;
  const passwordStrengthScore = strengthScore * PASSWORD_STRENGTH_MULTIPLIER;

  const getPasswordStrength = (): PasswordStrength => {
    switch (strengthScore) {
      case 5:
        return PasswordStrength.Great;
      case 4:
      case 3:
        return PasswordStrength.Decent;
      default:
        return PasswordStrength.Weak;
    }
  };

  const passwordStrength = getPasswordStrength();

  const getPasswordStrengthColor = (): string => {
    switch (passwordStrength) {
      case PasswordStrength.Weak:
        return theme.palette.error.contrastText;
      case PasswordStrength.Decent:
        return theme.palette.amber.main;
      case PasswordStrength.Good:
        return theme.palette.greens.dark;
      case PasswordStrength.Great:
        return theme.palette.greens.darker;
      default:
        throw new Error(translateText(["InvalidPasswordStrength"]));
    }
  };

  const ValidationItem: React.FC<{ label: string; isValid: boolean }> = ({
    label,
    isValid
  }) => (
    <Stack
      direction="row"
      alignItems="center"
      mb={compact ? "0.25rem" : "0.5rem"}
      spacing={compact ? 0.5 : 1}
    >
      {isValid ? (
        <CheckCircleIcon
          sx={{
            color: theme.palette.greens.dark,
            fontSize: compact ? "1rem" : "1.25rem"
          }}
        />
      ) : (
        <RadioButtonUncheckedIcon
          sx={{
            color: theme.palette.grey[300],
            fontSize: compact ? "1rem" : "1.25rem"
          }}
        />
      )}
      <Typography
        sx={{
          color: isValid ? "inherit" : theme.palette.grey[700],
          transition: "color 0.3s ease",
          fontSize: fontSize
        }}
      >
        {label}
      </Typography>
    </Stack>
  );

  return (
    <>
      <Box>
        <LinearProgress
          variant="determinate"
          value={passwordStrengthScore}
          sx={{
            height: compact ? 2 : 3,
            borderRadius: 2,
            marginTop: "0.5rem",
            "& .MuiLinearProgress-bar": {
              backgroundColor: getPasswordStrengthColor()
            },
            backgroundColor: "#E0E0E0"
          }}
        />
      </Box>
      {showStrengthText && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: compact ? "0.125rem" : "0.25rem",
            lineHeight: compact ? "1.5rem" : "2rem"
          }}
        >
          <Typography
            variant="caption"
            style={{
              fontSize: compact ? "0.75rem" : "1rem",
              fontWeight: 400
            }}
          >
            {translateText(["PasswordStrength"])}
          </Typography>
          <Typography
            variant="caption"
            style={{
              color: getPasswordStrengthColor(),
              fontSize: compact ? "0.75rem" : "1rem"
            }}
          >
            {passwordStrength}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: compact ? "0.75rem" : "1.25rem",
          mr: compact ? "0.5rem" : "0.75rem",
          gap: compact ? "1rem" : "0"
        }}
      >
        <Box>
          <ValidationItem
            label={translateText(["lowercase"])}
            isValid={validations.lowercase}
          />
          <ValidationItem
            label={translateText(["uppercase"])}
            isValid={validations.uppercase}
          />
          <ValidationItem
            label={translateText(["number"])}
            isValid={validations.number}
          />
        </Box>

        <Box>
          <ValidationItem
            label={translateText(["length"])}
            isValid={validations.length}
          />
          <ValidationItem
            label={translateText(["specialChar"])}
            isValid={validations.specialChar}
          />
        </Box>
      </Box>
    </>
  );
};

export default PasswordStrengthMeter;
