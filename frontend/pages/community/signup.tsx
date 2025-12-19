import { Box } from "@mui/material";
import { useFormik } from "formik";
import { NextPage } from "next";
import { signIn } from "~community/common/context/AuthContext";
import { NextRouter, useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { useCheckOrgSetupStatus } from "~community/common/api/OrganizationCreateApi";
import SetupSuperAdminForm from "~community/common/components/organisms/Forms/SignUpForm/setupSuperAdminForm/SetupSuperAdminForm";
import OnboardingLayout from "~community/common/components/templates/OnboardingLayout/OnboardingLayout";
import ROUTES from "~community/common/constants/routes";
import { MAX_PASSWORD_STRENGTH } from "~community/common/constants/stringConstants";
import useOrgSetupRedirect from "~community/common/hooks/useOrgSetupRedirect";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { getPasswordStrength } from "~community/common/utils/organizationCreateUtil";
import { signUpValidation } from "~community/common/utils/validation";

const SignUp: NextPage = () => {
  const translateText = useTranslator("onboarding", "organizationCreate");
  const translateToastText = useTranslator("onboarding", "resetPassword");
  const router: NextRouter = useRouter();
  const { navigateByStatus } = useOrgSetupRedirect();
  const { setToastMessage } = useToast();

  const { data: orgSetupStatus } = useCheckOrgSetupStatus();

  const [isLoading, setIsLoading] = useState(false);

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  };

  const onSubmit = async (values: typeof initialValues) => {
    const passwordStrength = getPasswordStrength(values.password);
    const trueValueCount: number = Object.values(passwordStrength).filter(
      (val: boolean) => {
        return val;
      }
    ).length;
    const errors = await signUpForm.validateForm();
    if (Object.keys(errors).length === 0) {
      if (trueValueCount === MAX_PASSWORD_STRENGTH) {
        handleSubmit();
      } else {
        setToastMessage({
          open: true,
          toastType: "error",
          title: translateToastText(["passwordIsNotValidTitle"]),
          description: translateToastText(["passwordIsNotValidDescription"]),
          isIcon: true
        });
      }
    }
  };

  const signUpForm = useFormik({
    initialValues,
    validationSchema: signUpValidation(translateText),
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true
  });

  const { values, errors, setFieldValue, handleChange } = signUpForm;

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target) {
        signUpForm.setFieldError(event.target.name, "");
      }
    },
    [signUpForm]
  );

  useEffect(() => {
    if (orgSetupStatus?.data?.results[0]) {
      navigateByStatus(orgSetupStatus?.data?.results[0]);
    }
  }, [navigateByStatus, orgSetupStatus?.data?.results]);

  const handleSubmit = async () => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password
    });

    setIsLoading(false);

    if (result?.ok) {
      router.push(ROUTES.ORGANIZATION.SETUP);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        overflowY: "auto"
      }}
    >
      <OnboardingLayout
        heading={translateText(["pageHeading"])}
        subheading={translateText(["pageSubHeading"])}
        onClick={() => {
          onSubmit(values);
        }}
        isLoading={isLoading}
      >
        <SetupSuperAdminForm
          handleChange={handleChange}
          handleInput={handleInput}
          values={values}
          errors={errors}
        />
      </OnboardingLayout>
    </Box>
  );
};
export default SignUp;
