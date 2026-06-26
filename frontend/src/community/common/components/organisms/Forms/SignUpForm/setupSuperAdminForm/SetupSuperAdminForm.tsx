import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, IconButton, InputAdornment } from "@mui/material";
import React, { ChangeEvent, useState } from "react";

import Form from "~community/common/components/molecules/Form/Form";
import InputField from "~community/common/components/molecules/InputField/InputField";
import PasswordStrengthMeter from "~community/common/components/molecules/PasswordStrengthMeter/PasswordStrengthMeter";
import { characterLengths } from "~community/common/constants/stringConstants";
import { inputFieldTestIds } from "~community/common/constants/testIds";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { isValidNamePattern } from "~community/common/utils/validation";

import { styles } from "./styles";

interface Props {
  handleChange: (event: React.SyntheticEvent) => void;
  handleInput: (e: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  errors: { [key: string]: string };
  values: any;
}

const SetupSuperAdminForm: React.FC<Props> = ({
  handleChange,
  handleInput,
  errors,
  values
}) => {
  const translateText = useTranslator("onboarding", "organizationCreate");
  const classes = styles();

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false
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

  const handleValidatedChange = (
    event: ChangeEvent<HTMLInputElement>,
    formikHandleChange: (e: ChangeEvent<HTMLInputElement>) => void
  ) => {
    const { value, name } = event.target;
    const isValidInput = isValidNamePattern(value);

    if ((name === "firstName" || name === "lastName") && isValidInput) {
      formikHandleChange(event);
    }
  };

  return (
    <Box sx={classes.container}>
      <Form>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            margin: "auto"
          }}
        >
          <InputField
            label={translateText(["firstNameLabel"])}
            inputType="text"
            inputName="firstName"
            required={true}
            value={values.firstName}
            placeHolder="Enter first name"
            onChange={(e) => handleValidatedChange(e, handleChange)}
            onInput={handleInput}
            error={errors.firstName ?? ""}
            isDisabled={false}
            inputProps={{ maxLength: 50 }}
            data-testid={inputFieldTestIds.signUp.firstName}
            validation-testid={inputFieldTestIds.signUp.firstNameValidation}
          />
          <InputField
            label={translateText(["lastNameLabel"])}
            inputName="lastName"
            inputType="text"
            required
            value={values.lastName}
            onChange={(e) => handleValidatedChange(e, handleChange)}
            placeHolder="Enter last name"
            onInput={handleInput}
            error={errors.lastName ?? ""}
            inputProps={{ maxLength: 50 }}
            data-testid={inputFieldTestIds.signUp.lastName}
            validation-testid={inputFieldTestIds.signUp.lastNameValidation}
          />
        </Box>
        <InputField
          label={translateText(["emailLabel"])}
          inputName="email"
          inputType="text"
          required
          value={values.email}
          componentStyle={classes.workEmailStyle}
          placeHolder="Enter work email"
          onChange={handleChange}
          onInput={handleInput}
          inputProps={{ maxLength: characterLengths.COMPANY_NAME_LENGTH }}
          error={errors.email ?? ""}
          data-testid={inputFieldTestIds.signUp.email}
          validation-testid={inputFieldTestIds.signUp.emailValidation}
        />
        <InputField
          label={translateText(["passwordLabel"])}
          inputName="password"
          required
          inputType={passwordVisibility.password ? "text" : "password"}
          value={values.password}
          componentStyle={classes.workEmailStyle}
          placeHolder="Enter password"
          onChange={handleChange}
          onInput={handleInput}
          error={errors.password ?? ""}
          data-testid={inputFieldTestIds.signUp.password}
          validation-testid={inputFieldTestIds.signUp.passwordValidation}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                sx={{ p: "1rem" }}
                onMouseDown={() => togglePasswordVisibility("password", true)}
                onMouseUp={() => togglePasswordVisibility("password", false)}
                onMouseLeave={() => togglePasswordVisibility("password", false)}
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
        {values.password.length > 0 && (
          <PasswordStrengthMeter password={values.password} />
        )}
      </Form>
    </Box>
  );
};
export default SetupSuperAdminForm;
