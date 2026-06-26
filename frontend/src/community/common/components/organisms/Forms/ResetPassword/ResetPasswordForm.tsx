import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, Stack, SxProps } from "@mui/material";
import React, { FocusEvent, useState } from "react";

import Form from "~community/common/components/molecules/Form/Form";
import InputField from "~community/common/components/molecules/InputField/InputField";
import PasswordStrengthMeter from "~community/common/components/molecules/PasswordStrengthMeter/PasswordStrengthMeter";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { mergeSx } from "~community/common/utils/commonUtil";

import { styles } from "./styles";

interface Props {
  handleChange: (event: React.SyntheticEvent) => void;
  handleBlur: (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void | Promise<void>;
  values: {
    password: string;
    confirmPassword: string;
  };
  errors?: Partial<{
    password: string;
    confirmPassword: string;
  }>;
  touched?: Partial<{
    password: boolean;
    confirmPassword: boolean;
  }>;
  containerStyles?: SxProps;
}

const classes = styles();

const ResetPasswordForm: React.FC<Props> = ({
  handleChange,
  handleBlur,
  values,
  errors = {},
  touched = {},
  containerStyles
}) => {
  const translateText = useTranslator("onboarding", "resetPassword");

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false
  });

  const togglePasswordVisibility = (
    field: keyof typeof passwordVisibility,
    isVisible: boolean
  ) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: isVisible
    }));
  };

  return (
    <Stack sx={mergeSx([classes.container, containerStyles])}>
      <Form>
        <Stack sx={{ margin: "auto" }}>
          <InputField
            label={translateText(["passwordLabel"])}
            inputName="password"
            inputType={passwordVisibility.password ? "text" : "password"}
            required
            value={values.password}
            onChange={handleChange}
            onBlur={(e) =>
              handleBlur(
                e as FocusEvent<HTMLInputElement | HTMLTextAreaElement>
              )
            }
            error={touched.password && errors.password ? errors.password : ""}
            componentStyle={classes.textInputStyle}
            showAsterisk={false}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  sx={{ p: "1rem" }}
                  onMouseDown={() => togglePasswordVisibility("password", true)}
                  onMouseUp={() => togglePasswordVisibility("password", false)}
                  onMouseLeave={() =>
                    togglePasswordVisibility("password", false)
                  }
                >
                  {passwordVisibility.password ? (
                    <Visibility />
                  ) : (
                    <VisibilityOff />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
          {values.password && (
            <PasswordStrengthMeter password={values.password} />
          )}
          <InputField
            label={translateText(["confirmPasswordLabel"])}
            inputName="confirmPassword"
            inputType={passwordVisibility.confirmPassword ? "text" : "password"}
            required
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={(e) =>
              handleBlur(
                e as FocusEvent<HTMLInputElement | HTMLTextAreaElement>
              )
            }
            componentStyle={classes.textInputStyle}
            showAsterisk={false}
            error={
              touched.confirmPassword && errors.confirmPassword
                ? errors.confirmPassword
                : ""
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  sx={{ p: "1rem" }}
                  onMouseDown={() =>
                    togglePasswordVisibility("confirmPassword", true)
                  }
                  onMouseUp={() =>
                    togglePasswordVisibility("confirmPassword", false)
                  }
                  onMouseLeave={() =>
                    togglePasswordVisibility("confirmPassword", false)
                  }
                >
                  {passwordVisibility.confirmPassword ? (
                    <Visibility />
                  ) : (
                    <VisibilityOff />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
        </Stack>
      </Form>
    </Stack>
  );
};

export default ResetPasswordForm;
