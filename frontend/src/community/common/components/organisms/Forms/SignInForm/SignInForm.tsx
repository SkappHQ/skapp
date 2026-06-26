import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, Stack } from "@mui/material";
import React, { ChangeEvent, useState } from "react";

import Form from "~community/common/components/molecules/Form/Form";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { inputFieldTestIds } from "~community/common/constants/testIds";
import { useTranslator } from "~community/common/hooks/useTranslator";

import { styles } from "./styles";

interface Props {
  handleChange: (event: React.SyntheticEvent) => void;
  handleInput: (e: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  values: {
    email: string;
    password: string;
  };
  errors: { [key: string]: string };
}

const SignInForm: React.FC<Props> = ({
  handleChange,
  handleInput,
  values,
  errors
}) => {
  const translateText = useTranslator("onboarding", "signIn");
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

  return (
    <Stack sx={classes.container}>
      <Form>
        <Stack sx={{ margin: "auto" }}>
          <InputField
            label={translateText(["emailLabel"])}
            inputName="email"
            inputType="email"
            required
            value={values.email}
            onChange={handleChange}
            componentStyle={classes.textInputStyle}
            onInput={handleInput}
            error={errors.email ?? ""}
            isDisabled={false}
            showAsterisk={false}
            data-testid={inputFieldTestIds.signIn.email}
            validation-testid={inputFieldTestIds.signIn.emailValidation}
          />
          <InputField
            label={translateText(["passwordLabel"])}
            inputName="password"
            inputType={passwordVisibility.password ? "text" : "password"}
            required
            value={values.password}
            onChange={handleChange}
            componentStyle={classes.textInputStyle}
            onInput={handleInput}
            error={errors.password ?? ""}
            isDisabled={false}
            showAsterisk={false}
            data-testid={inputFieldTestIds.signIn.password}
            validation-testid={inputFieldTestIds.signIn.passwordValidation}
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
        </Stack>
      </Form>
    </Stack>
  );
};

export default SignInForm;
